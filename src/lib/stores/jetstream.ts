import { writable, derived } from 'svelte/store';

// Types for Jetstream events
export interface JetstreamEvent {
	did: string;
	time_us: number;
	kind: 'commit' | 'identity' | 'account';
	commit?: {
		rev: string;
		operation: 'create' | 'update' | 'delete';
		collection: string;
		rkey: string;
		record?: Record<string, unknown>;
		cid?: string;
	};
}

export interface ActivityStats {
	posts: number;
	likes: number;
	reposts: number;
	follows: number;
	blocks: number;
	total: number;
}

export interface ContentStats {
	hashtags: Map<string, number>;
	languages: Map<string, number>;
	hasImages: number;
	textOnly: number;
}

interface StoreState {
	connected: boolean;
	events: JetstreamEvent[];
	activityPerSecond: ActivityStats;
	activityTotal: ActivityStats;
	contentStats: ContentStats;
	recentPosts: Array<{ text: string; handle: string; time: Date }>;
	eventsPerSecond: number;
}

const JETSTREAM_URL = 'wss://jetstream2.us-east.bsky.network/subscribe';
const COLLECTIONS = [
	'app.bsky.feed.post',
	'app.bsky.feed.like',
	'app.bsky.feed.repost',
	'app.bsky.graph.follow',
	'app.bsky.graph.block'
];

function createJetstreamStore() {
	let ws: WebSocket | null = null;
	let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
	let eventBuffer: JetstreamEvent[] = [];
	let lastSecondTimestamp = Date.now();
	let secondInterval: ReturnType<typeof setInterval> | null = null;

	const initialState: StoreState = {
		connected: false,
		events: [],
		activityPerSecond: { posts: 0, likes: 0, reposts: 0, follows: 0, blocks: 0, total: 0 },
		activityTotal: { posts: 0, likes: 0, reposts: 0, follows: 0, blocks: 0, total: 0 },
		contentStats: {
			hashtags: new Map(),
			languages: new Map(),
			hasImages: 0,
			textOnly: 0
		},
		recentPosts: [],
		eventsPerSecond: 0
	};

	const { subscribe, set, update } = writable<StoreState>(initialState);

	function extractHashtags(text: string): string[] {
		const hashtagRegex = /#[\w\u00C0-\u024F\u1E00-\u1EFF]+/g;
		return (text.match(hashtagRegex) || []).map((tag) => tag.toLowerCase());
	}

	function processEvent(event: JetstreamEvent, state: StoreState): StoreState {
		if (event.kind !== 'commit' || !event.commit) return state;

		const collection = event.commit.collection;
		const operation = event.commit.operation;

		if (operation !== 'create') return state;

		const newState = { ...state };
		newState.activityTotal = { ...state.activityTotal };
		newState.contentStats = {
			...state.contentStats,
			hashtags: new Map(state.contentStats.hashtags),
			languages: new Map(state.contentStats.languages)
		};

		switch (collection) {
			case 'app.bsky.feed.post':
				newState.activityTotal.posts++;
				newState.activityTotal.total++;

				// Extract content stats from post
				if (event.commit.record) {
					const record = event.commit.record as {
						text?: string;
						langs?: string[];
						embed?: { $type?: string };
					};

					// Extract hashtags
					if (record.text) {
						const hashtags = extractHashtags(record.text);
						hashtags.forEach((tag) => {
							const count = newState.contentStats.hashtags.get(tag) || 0;
							newState.contentStats.hashtags.set(tag, count + 1);
						});

						// Track recent posts (keep last 10)
						newState.recentPosts = [
							{ text: record.text.slice(0, 100), handle: event.did.slice(-8), time: new Date() },
							...state.recentPosts.slice(0, 9)
						];
					}

					// Track languages
					if (record.langs && record.langs.length > 0) {
						record.langs.forEach((lang) => {
							const count = newState.contentStats.languages.get(lang) || 0;
							newState.contentStats.languages.set(lang, count + 1);
						});
					}

					// Track images
					if (record.embed && record.embed.$type?.includes('image')) {
						newState.contentStats.hasImages++;
					} else {
						newState.contentStats.textOnly++;
					}
				}
				break;

			case 'app.bsky.feed.like':
				newState.activityTotal.likes++;
				newState.activityTotal.total++;
				break;

			case 'app.bsky.feed.repost':
				newState.activityTotal.reposts++;
				newState.activityTotal.total++;
				break;

			case 'app.bsky.graph.follow':
				newState.activityTotal.follows++;
				newState.activityTotal.total++;
				break;

			case 'app.bsky.graph.block':
				newState.activityTotal.blocks++;
				newState.activityTotal.total++;
				break;
		}

		return newState;
	}

	function connect() {
		if (ws) {
			ws.close();
		}

		const params = new URLSearchParams();
		COLLECTIONS.forEach((c) => params.append('wantedCollections', c));

		ws = new WebSocket(`${JETSTREAM_URL}?${params.toString()}`);

		ws.onopen = () => {
			update((state) => ({ ...state, connected: true }));
			console.log('Connected to Jetstream');
		};

		ws.onmessage = (msg) => {
			try {
				const event: JetstreamEvent = JSON.parse(msg.data);
				eventBuffer.push(event);
				update((state) => processEvent(event, state));
			} catch (e) {
				console.error('Error parsing event:', e);
			}
		};

		ws.onclose = () => {
			update((state) => ({ ...state, connected: false }));
			console.log('Disconnected from Jetstream, reconnecting...');
			reconnectTimeout = setTimeout(connect, 3000);
		};

		ws.onerror = (error) => {
			console.error('WebSocket error:', error);
		};

		// Calculate events per second
		if (secondInterval) clearInterval(secondInterval);
		secondInterval = setInterval(() => {
			const now = Date.now();
			const elapsed = (now - lastSecondTimestamp) / 1000;
			const eps = Math.round(eventBuffer.length / elapsed);

			// Calculate per-second breakdown
			const perSecond: ActivityStats = { posts: 0, likes: 0, reposts: 0, follows: 0, blocks: 0, total: 0 };
			eventBuffer.forEach((event) => {
				if (event.kind === 'commit' && event.commit?.operation === 'create') {
					switch (event.commit.collection) {
						case 'app.bsky.feed.post':
							perSecond.posts++;
							break;
						case 'app.bsky.feed.like':
							perSecond.likes++;
							break;
						case 'app.bsky.feed.repost':
							perSecond.reposts++;
							break;
						case 'app.bsky.graph.follow':
							perSecond.follows++;
							break;
						case 'app.bsky.graph.block':
							perSecond.blocks++;
							break;
					}
					perSecond.total++;
				}
			});

			update((state) => ({
				...state,
				eventsPerSecond: eps,
				activityPerSecond: perSecond
			}));

			eventBuffer = [];
			lastSecondTimestamp = now;
		}, 1000);
	}

	function disconnect() {
		if (ws) {
			ws.close();
			ws = null;
		}
		if (reconnectTimeout) {
			clearTimeout(reconnectTimeout);
			reconnectTimeout = null;
		}
		if (secondInterval) {
			clearInterval(secondInterval);
			secondInterval = null;
		}
		set(initialState);
	}

	return {
		subscribe,
		connect,
		disconnect
	};
}

export const jetstream = createJetstreamStore();

// Derived stores for specific data
export const isConnected = derived(jetstream, ($js) => $js.connected);
export const activityPerSecond = derived(jetstream, ($js) => $js.activityPerSecond);
export const activityTotal = derived(jetstream, ($js) => $js.activityTotal);
export const contentStats = derived(jetstream, ($js) => $js.contentStats);
export const recentPosts = derived(jetstream, ($js) => $js.recentPosts);
export const eventsPerSecond = derived(jetstream, ($js) => $js.eventsPerSecond);

// Top hashtags derived store
export const topHashtags = derived(jetstream, ($js) => {
	const entries = Array.from($js.contentStats.hashtags.entries());
	return entries.sort((a, b) => b[1] - a[1]).slice(0, 10);
});

// Top languages derived store
export const topLanguages = derived(jetstream, ($js) => {
	const entries = Array.from($js.contentStats.languages.entries());
	return entries.sort((a, b) => b[1] - a[1]).slice(0, 10);
});
