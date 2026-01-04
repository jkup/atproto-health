import { writable, derived } from 'svelte/store';

export interface NetworkStats {
	totalUsers: number | null;
	growthRate: number | null;
	lastUpdated: Date | null;
	loading: boolean;
	error: string | null;
}

const initialState: NetworkStats = {
	totalUsers: null,
	growthRate: null,
	lastUpdated: null,
	loading: false,
	error: null
};

function createNetworkStore() {
	const { subscribe, set, update } = writable<NetworkStats>(initialState);

	async function fetchStats() {
		update((state) => ({ ...state, loading: true, error: null }));

		try {
			// Fetch from the public Bluesky API - describe server endpoint
			const response = await fetch('https://public.api.bsky.app/xrpc/app.bsky.actor.searchActors?q=a&limit=1');

			// We can't get exact user count from public API easily,
			// so we'll use an estimate based on known data
			// The actual count can be fetched from bsky.jazco.dev or similar services

			// For now, let's try to get some network info
			const plcResponse = await fetch('https://plc.directory/export?count=true', {
				method: 'HEAD'
			}).catch(() => null);

			// Estimate based on latest known data (~41.5M users as of late 2024)
			// In production, you'd want to integrate with a stats API
			const estimatedUsers = 41500000 + Math.floor((Date.now() - new Date('2024-12-01').getTime()) / 1000 * 0.3);

			update((state) => ({
				...state,
				totalUsers: estimatedUsers,
				growthRate: 0.3, // ~0.3 users per second
				lastUpdated: new Date(),
				loading: false
			}));
		} catch (error) {
			update((state) => ({
				...state,
				loading: false,
				error: error instanceof Error ? error.message : 'Failed to fetch stats'
			}));
		}
	}

	// Increment user count estimate based on growth rate
	function startUserCounter() {
		return setInterval(() => {
			update((state) => {
				if (state.totalUsers && state.growthRate) {
					return {
						...state,
						totalUsers: state.totalUsers + state.growthRate
					};
				}
				return state;
			});
		}, 1000);
	}

	return {
		subscribe,
		fetchStats,
		startUserCounter
	};
}

export const networkStats = createNetworkStore();

// Formatted user count
export const formattedUserCount = derived(networkStats, ($stats) => {
	if (!$stats.totalUsers) return '---';
	return new Intl.NumberFormat('en-US').format(Math.floor($stats.totalUsers));
});
