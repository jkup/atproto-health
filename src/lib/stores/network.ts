import { writable, derived } from 'svelte/store';

export interface GlobalStats {
	// From bsky-stats.scroll.blue
	totalUsers: number | null;
	totalPosts: number | null;
	totalLikes: number | null;
	totalFollows: number | null;
	growthRate: number | null;

	// From ClearSky
	activeUsers: number | null;
	deletedUsers: number | null;
	totalBlocks: number | null;
	percentUsersBlocking: number | null;
	percentUsersBlocked: number | null;

	// Meta
	lastUpdated: Date | null;
	loading: boolean;
	error: string | null;
}

const initialState: GlobalStats = {
	totalUsers: null,
	totalPosts: null,
	totalLikes: null,
	totalFollows: null,
	growthRate: null,
	activeUsers: null,
	deletedUsers: null,
	totalBlocks: null,
	percentUsersBlocking: null,
	percentUsersBlocked: null,
	lastUpdated: null,
	loading: false,
	error: null
};

function createGlobalStatsStore() {
	const { subscribe, set, update } = writable<GlobalStats>(initialState);

	async function fetchStats() {
		update((state) => ({ ...state, loading: true, error: null }));

		try {
			// Fetch from both APIs in parallel
			const [bskyStatsRes, clearSkyUsersRes, clearSkyBlocksRes] = await Promise.all([
				fetch('https://bsky-stats.scroll.blue').then((r) => r.json()),
				fetch('https://public.api.clearsky.services/api/v1/anon/total-users').then((r) => r.json()),
				fetch('https://public.api.clearsky.services/api/v1/anon/lists/block-stats').then((r) => r.json())
			]);

			update((state) => ({
				...state,
				// bsky-stats data
				totalUsers: bskyStatsRes.total_users,
				totalPosts: bskyStatsRes.total_posts,
				totalLikes: bskyStatsRes.total_likes,
				totalFollows: bskyStatsRes.total_follows,
				growthRate: bskyStatsRes.users_growth_rate_per_second,

				// ClearSky data
				activeUsers: clearSkyUsersRes.data.active_count.value,
				deletedUsers: clearSkyUsersRes.data.deleted_count.value,
				totalBlocks: clearSkyBlocksRes.data.numberOfTotalBlocks,
				percentUsersBlocking: clearSkyBlocksRes.data.percentUsersBlocking,
				percentUsersBlocked: clearSkyBlocksRes.data.percentUsersBlocked,

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

	// Live counter that increments based on growth rate
	function startLiveCounter() {
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
		startLiveCounter
	};
}

export const globalStats = createGlobalStatsStore();

// Formatted number helpers
function formatLargeNumber(n: number | null): string {
	if (n === null) return '---';
	if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
	if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
	if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
	return n.toLocaleString();
}

// Derived stores for formatted values
export const formattedTotalUsers = derived(globalStats, ($s) => formatLargeNumber($s.totalUsers));
export const formattedTotalPosts = derived(globalStats, ($s) => formatLargeNumber($s.totalPosts));
export const formattedTotalLikes = derived(globalStats, ($s) => formatLargeNumber($s.totalLikes));
export const formattedTotalFollows = derived(globalStats, ($s) => formatLargeNumber($s.totalFollows));
export const formattedActiveUsers = derived(globalStats, ($s) => formatLargeNumber($s.activeUsers));
export const formattedDeletedUsers = derived(globalStats, ($s) => formatLargeNumber($s.deletedUsers));
export const formattedTotalBlocks = derived(globalStats, ($s) => formatLargeNumber($s.totalBlocks));
