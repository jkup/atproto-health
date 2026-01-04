import { writable, derived } from 'svelte/store';
import type { ActivityStats } from './jetstream';

export interface HistoryPoint {
	timestamp: Date;
	stats: ActivityStats;
}

const MAX_HISTORY_POINTS = 60; // Keep 60 seconds of history

function createHistoryStore() {
	const { subscribe, update } = writable<HistoryPoint[]>([]);

	function addPoint(stats: ActivityStats) {
		update((history) => {
			const newPoint: HistoryPoint = {
				timestamp: new Date(),
				stats: { ...stats }
			};

			const newHistory = [...history, newPoint];

			// Keep only the last MAX_HISTORY_POINTS entries
			if (newHistory.length > MAX_HISTORY_POINTS) {
				return newHistory.slice(-MAX_HISTORY_POINTS);
			}

			return newHistory;
		});
	}

	function clear() {
		update(() => []);
	}

	return {
		subscribe,
		addPoint,
		clear
	};
}

export const activityHistory = createHistoryStore();

// Derived store for chart data format
export const chartData = derived(activityHistory, ($history) => {
	return {
		labels: $history.map((p) => {
			const time = p.timestamp;
			return `${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
		}),
		posts: $history.map((p) => p.stats.posts),
		likes: $history.map((p) => p.stats.likes),
		reposts: $history.map((p) => p.stats.reposts),
		follows: $history.map((p) => p.stats.follows),
		total: $history.map((p) => p.stats.total)
	};
});
