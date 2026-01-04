<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		jetstream,
		activityPerSecond,
		activityTotal,
		contentStats
	} from '$lib/stores/jetstream';
	import { networkStats, formattedUserCount } from '$lib/stores/network';
	import { activityHistory } from '$lib/stores/history';

	import StatCard from '$lib/components/StatCard.svelte';
	import ActivityChart from '$lib/components/ActivityChart.svelte';
	import TopHashtags from '$lib/components/TopHashtags.svelte';
	import TopLanguages from '$lib/components/TopLanguages.svelte';
	import ConnectionStatus from '$lib/components/ConnectionStatus.svelte';
	import LiveFeed from '$lib/components/LiveFeed.svelte';

	let userCounterInterval: ReturnType<typeof setInterval>;
	let historyInterval: ReturnType<typeof setInterval>;

	onMount(() => {
		// Connect to Jetstream
		jetstream.connect();

		// Fetch network stats
		networkStats.fetchStats();
		userCounterInterval = networkStats.startUserCounter();

		// Record history every second
		historyInterval = setInterval(() => {
			activityHistory.addPoint($activityPerSecond);
		}, 1000);
	});

	onDestroy(() => {
		jetstream.disconnect();
		if (userCounterInterval) clearInterval(userCounterInterval);
		if (historyInterval) clearInterval(historyInterval);
	});

	function formatNumber(n: number): string {
		if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
		if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
		return n.toLocaleString();
	}
</script>

<svelte:head>
	<title>AT Protocol Health Dashboard</title>
	<meta name="description" content="Real-time health metrics for the AT Protocol ecosystem" />
</svelte:head>

<div class="dashboard">
	<header class="dashboard-header">
		<div class="header-left">
			<h1>
				<span class="logo">AT</span>
				Protocol Health
			</h1>
			<p class="subtitle">Real-time ecosystem metrics</p>
		</div>
		<div class="header-right">
			<ConnectionStatus />
		</div>
	</header>

	<section class="network-stats">
		<StatCard
			title="Total Users"
			value={$formattedUserCount}
			subtitle="Growing ~0.3/sec"
			color="#3b82f6"
			icon="👥"
		/>
		<StatCard
			title="Posts (Session)"
			value={formatNumber($activityTotal.posts)}
			subtitle="{$activityPerSecond.posts}/sec"
			color="#22c55e"
			icon="📝"
		/>
		<StatCard
			title="Likes (Session)"
			value={formatNumber($activityTotal.likes)}
			subtitle="{$activityPerSecond.likes}/sec"
			color="#ef4444"
			icon="❤️"
		/>
		<StatCard
			title="Follows (Session)"
			value={formatNumber($activityTotal.follows)}
			subtitle="{$activityPerSecond.follows}/sec"
			color="#a855f7"
			icon="👤"
		/>
	</section>

	<section class="activity-grid">
		<div class="chart-section">
			<ActivityChart />
		</div>
		<div class="feed-section">
			<LiveFeed />
		</div>
	</section>

	<section class="content-stats">
		<div class="content-card">
			<TopHashtags />
		</div>
		<div class="content-card">
			<TopLanguages />
		</div>
		<div class="content-card">
			<div class="media-stats">
				<h3>Content Types</h3>
				<div class="media-breakdown">
					<div class="media-item">
						<span class="media-label">Text Only</span>
						<span class="media-value">{$contentStats.textOnly.toLocaleString()}</span>
					</div>
					<div class="media-item">
						<span class="media-label">With Images</span>
						<span class="media-value">{$contentStats.hasImages.toLocaleString()}</span>
					</div>
					{#if $contentStats.textOnly + $contentStats.hasImages > 0}
						{@const total = $contentStats.textOnly + $contentStats.hasImages}
						<div class="media-bar">
							<div
								class="media-bar-text"
								style="width: {($contentStats.textOnly / total) * 100}%"
							></div>
							<div
								class="media-bar-image"
								style="width: {($contentStats.hasImages / total) * 100}%"
							></div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<section class="secondary-stats">
		<StatCard
			title="Reposts (Session)"
			value={formatNumber($activityTotal.reposts)}
			subtitle="{$activityPerSecond.reposts}/sec"
			color="#f59e0b"
			icon="🔄"
		/>
		<StatCard
			title="Blocks (Session)"
			value={formatNumber($activityTotal.blocks)}
			subtitle="{$activityPerSecond.blocks}/sec"
			color="#6b7280"
			icon="🚫"
		/>
		<StatCard
			title="Total Events"
			value={formatNumber($activityTotal.total)}
			subtitle="All activity types"
			color="#06b6d4"
			icon="📊"
		/>
	</section>

	<footer class="dashboard-footer">
		<p>
			Data sourced from
			<a href="https://docs.bsky.app/blog/jetstream" target="_blank" rel="noopener">Jetstream</a>
			&middot; Built with
			<a href="https://svelte.dev" target="_blank" rel="noopener">SvelteKit</a>
			&middot;
			<a href="https://atproto.com" target="_blank" rel="noopener">AT Protocol</a>
		</p>
	</footer>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			'Inter',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
		background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
		min-height: 100vh;
		color: #f1f5f9;
	}

	.dashboard {
		max-width: 1400px;
		margin: 0 auto;
		padding: 1.5rem;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid rgba(148, 163, 184, 0.1);
	}

	h1 {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.logo {
		background: linear-gradient(135deg, #3b82f6, #8b5cf6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		font-weight: 800;
	}

	.subtitle {
		font-size: 0.875rem;
		color: #64748b;
		margin: 0.25rem 0 0 0;
	}

	.network-stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.activity-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.chart-section,
	.feed-section {
		min-height: 300px;
	}

	.content-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.media-stats {
		background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
		border: 1px solid rgba(148, 163, 184, 0.1);
		border-radius: 12px;
		padding: 1.25rem;
		height: 100%;
	}

	.media-stats h3 {
		font-size: 0.875rem;
		font-weight: 600;
		color: #f1f5f9;
		margin: 0 0 1rem 0;
	}

	.media-breakdown {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.media-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.media-label {
		font-size: 0.75rem;
		color: #94a3b8;
	}

	.media-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: #f1f5f9;
		font-variant-numeric: tabular-nums;
	}

	.media-bar {
		display: flex;
		height: 8px;
		border-radius: 4px;
		overflow: hidden;
		margin-top: 0.5rem;
	}

	.media-bar-text {
		background: #3b82f6;
		transition: width 0.3s ease;
	}

	.media-bar-image {
		background: #22c55e;
		transition: width 0.3s ease;
	}

	.secondary-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.dashboard-footer {
		text-align: center;
		padding: 1.5rem 0;
		border-top: 1px solid rgba(148, 163, 184, 0.1);
	}

	.dashboard-footer p {
		font-size: 0.75rem;
		color: #64748b;
		margin: 0;
	}

	.dashboard-footer a {
		color: #3b82f6;
		text-decoration: none;
	}

	.dashboard-footer a:hover {
		text-decoration: underline;
	}

	/* Responsive */
	@media (max-width: 1200px) {
		.network-stats {
			grid-template-columns: repeat(2, 1fr);
		}

		.activity-grid {
			grid-template-columns: 1fr;
		}

		.content-stats {
			grid-template-columns: 1fr;
		}

		.secondary-stats {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (max-width: 768px) {
		.network-stats {
			grid-template-columns: 1fr;
		}

		.secondary-stats {
			grid-template-columns: 1fr;
		}

		.dashboard-header {
			flex-direction: column;
			gap: 1rem;
		}
	}
</style>
