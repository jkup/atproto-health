<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { jetstream, activityPerSecond, contentStats } from '$lib/stores/jetstream';
	import {
		globalStats,
		formattedTotalUsers,
		formattedTotalPosts,
		formattedTotalLikes,
		formattedTotalFollows,
		formattedActiveUsers,
		formattedDeletedUsers,
		formattedTotalBlocks
	} from '$lib/stores/network';
	import { activityHistory } from '$lib/stores/history';

	import StatCard from '$lib/components/StatCard.svelte';
	import ActivityChart from '$lib/components/ActivityChart.svelte';
	import TopHashtags from '$lib/components/TopHashtags.svelte';
	import TopLanguages from '$lib/components/TopLanguages.svelte';
	import ConnectionStatus from '$lib/components/ConnectionStatus.svelte';
	import LiveFeed from '$lib/components/LiveFeed.svelte';

	let userCounterInterval: ReturnType<typeof setInterval>;
	let historyInterval: ReturnType<typeof setInterval>;
	let refreshInterval: ReturnType<typeof setInterval>;

	onMount(() => {
		// Connect to Jetstream for real-time data
		jetstream.connect();

		// Fetch global stats from APIs
		globalStats.fetchStats();
		userCounterInterval = globalStats.startLiveCounter();

		// Refresh global stats every 60 seconds
		refreshInterval = setInterval(() => {
			globalStats.fetchStats();
		}, 60000);

		// Record history every second for the chart
		historyInterval = setInterval(() => {
			activityHistory.addPoint($activityPerSecond);
		}, 1000);
	});

	onDestroy(() => {
		jetstream.disconnect();
		if (userCounterInterval) clearInterval(userCounterInterval);
		if (historyInterval) clearInterval(historyInterval);
		if (refreshInterval) clearInterval(refreshInterval);
	});
</script>

<svelte:head>
	<title>Bluesky Health Dashboard</title>
	<meta name="description" content="Real-time health metrics for Bluesky" />
</svelte:head>

<div class="dashboard">
	<header class="dashboard-header">
		<div class="header-left">
			<h1>
				<span class="logo">🦋</span>
				Bluesky Health
			</h1>
			<p class="subtitle">Real-time network metrics</p>
		</div>
		<div class="header-right">
			<ConnectionStatus />
		</div>
	</header>

	<!-- Global Network Stats -->
	<section class="section-title">
		<h2>Bluesky Network Totals</h2>
		<span class="section-subtitle">All-time cumulative statistics from bsky-stats API</span>
	</section>
	<section class="network-stats">
		<StatCard
			title="Total Users"
			value={$formattedTotalUsers}
			subtitle="+{$globalStats.growthRate?.toFixed(2) || '0'}/sec"
			color="#3b82f6"
		/>
		<StatCard
			title="Total Posts"
			value={$formattedTotalPosts}
			subtitle="All posts ever created"
			color="#22c55e"
		/>
		<StatCard
			title="Total Likes"
			value={$formattedTotalLikes}
			subtitle="All likes ever given"
			color="#ef4444"
		/>
		<StatCard
			title="Total Follows"
			value={$formattedTotalFollows}
			subtitle="All follow relationships"
			color="#a855f7"
		/>
	</section>

	<!-- Real-time Activity -->
	<section class="section-title">
		<h2>Bluesky Records</h2>
		<span class="section-subtitle">Real-time <code>app.bsky.*</code> records from Jetstream</span>
	</section>
	<section class="realtime-stats">
		<StatCard
			title="Post Records/sec"
			value={$activityPerSecond.posts.toString()}
			subtitle="New posts right now"
			color="#22c55e"
			collection="app.bsky.feed.post"
		/>
		<StatCard
			title="Like Records/sec"
			value={$activityPerSecond.likes.toString()}
			subtitle="Likes happening now"
			color="#ef4444"
			collection="app.bsky.feed.like"
		/>
		<StatCard
			title="Repost Records/sec"
			value={$activityPerSecond.reposts.toString()}
			subtitle="Reposts right now"
			color="#f59e0b"
			collection="app.bsky.feed.repost"
		/>
		<StatCard
			title="Follow Records/sec"
			value={$activityPerSecond.follows.toString()}
			subtitle="New follows right now"
			color="#a855f7"
			collection="app.bsky.graph.follow"
		/>
	</section>

	<!-- Activity Chart -->
	<section class="chart-section">
		<ActivityChart />
	</section>

	<!-- Live Feed -->
	<section class="feed-section">
		<LiveFeed />
	</section>

	<!-- Network Health -->
	<section class="section-title">
		<h2>Bluesky Moderation</h2>
		<span class="section-subtitle">User status and block stats from ClearSky API</span>
	</section>
	<section class="health-stats">
		<StatCard
			title="Active Users"
			value={$formattedActiveUsers}
			subtitle="Currently active accounts"
			color="#22c55e"
		/>
		<StatCard
			title="Deleted Users"
			value={$formattedDeletedUsers}
			subtitle="Accounts removed"
			color="#6b7280"
		/>
		<StatCard
			title="Total Blocks"
			value={$formattedTotalBlocks}
			subtitle="Block actions network-wide"
			color="#ef4444"
		/>
		<div class="block-percentages">
			<h3>Block Distribution</h3>
			<div class="percentage-row">
				<span class="percentage-label">Users who block others</span>
				<div class="percentage-bar-container">
					<div
						class="percentage-bar blocking"
						style="width: {$globalStats.percentUsersBlocking || 0}%"
					></div>
				</div>
				<span class="percentage-value">{$globalStats.percentUsersBlocking?.toFixed(1) || '0'}%</span>
			</div>
			<div class="percentage-row">
				<span class="percentage-label">Users who are blocked</span>
				<div class="percentage-bar-container">
					<div
						class="percentage-bar blocked"
						style="width: {$globalStats.percentUsersBlocked || 0}%"
					></div>
				</div>
				<span class="percentage-value">{$globalStats.percentUsersBlocked?.toFixed(1) || '0'}%</span>
			</div>
		</div>
	</section>

	<!-- Content Analysis -->
	<section class="section-title">
		<h2>Bluesky Content Analysis</h2>
		<span class="section-subtitle">Trends from <code>app.bsky.feed.post</code> records</span>
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
						<div class="media-legend">
							<span class="legend-item"><span class="dot text"></span> Text</span>
							<span class="legend-item"><span class="dot image"></span> Images</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<footer class="dashboard-footer">
		<p>
			Data from
			<a href="https://bsky-stats.scroll.blue" target="_blank" rel="noopener">bsky-stats</a>,
			<a href="https://clearsky.app" target="_blank" rel="noopener">ClearSky</a>, and
			<a href="https://docs.bsky.app/blog/jetstream" target="_blank" rel="noopener">Jetstream</a>
			&middot;
			<a href="https://atproto.com" target="_blank" rel="noopener">AT Protocol</a>
			&middot;
			<a href="https://github.com/jkup/atproto-health" target="_blank" rel="noopener">Source Code</a>
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
		font-size: 1.5rem;
	}

	.subtitle {
		font-size: 0.875rem;
		color: #64748b;
		margin: 0.25rem 0 0 0;
	}

	.section-title {
		margin: 2rem 0 1rem 0;
		display: flex;
		align-items: baseline;
		gap: 1rem;
	}

	.section-title h2 {
		font-size: 1rem;
		font-weight: 600;
		color: #f1f5f9;
		margin: 0;
	}

	.section-subtitle {
		font-size: 0.75rem;
		color: #64748b;
	}

	.section-subtitle code {
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
		font-size: 0.7rem;
		background: rgba(59, 130, 246, 0.15);
		color: #60a5fa;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
	}

	.network-stats,
	.realtime-stats,
	.health-stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}

	.chart-section {
		margin-top: 1.5rem;
		min-height: 300px;
	}

	.feed-section {
		margin-top: 1rem;
	}

	.content-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	/* Block percentages card */
	.block-percentages {
		background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
		border: 1px solid rgba(148, 163, 184, 0.1);
		border-radius: 12px;
		padding: 1.25rem;
	}

	.block-percentages h3 {
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #94a3b8;
		margin: 0 0 1rem 0;
	}

	.percentage-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.percentage-row:last-child {
		margin-bottom: 0;
	}

	.percentage-label {
		font-size: 0.75rem;
		color: #94a3b8;
		width: 140px;
		flex-shrink: 0;
	}

	.percentage-bar-container {
		flex: 1;
		height: 8px;
		background: rgba(148, 163, 184, 0.1);
		border-radius: 4px;
		overflow: hidden;
	}

	.percentage-bar {
		height: 100%;
		border-radius: 4px;
		transition: width 0.5s ease;
	}

	.percentage-bar.blocking {
		background: linear-gradient(90deg, #f59e0b, #ef4444);
	}

	.percentage-bar.blocked {
		background: linear-gradient(90deg, #ef4444, #dc2626);
	}

	.percentage-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: #f1f5f9;
		width: 50px;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	/* Media stats */
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

	.media-legend {
		display: flex;
		gap: 1rem;
		margin-top: 0.5rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.625rem;
		color: #64748b;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.dot.text {
		background: #3b82f6;
	}

	.dot.image {
		background: #22c55e;
	}

	.dashboard-footer {
		text-align: center;
		padding: 1.5rem 0;
		margin-top: 2rem;
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
		.network-stats,
		.realtime-stats,
		.health-stats {
			grid-template-columns: repeat(2, 1fr);
		}

		.content-stats {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.network-stats,
		.realtime-stats,
		.health-stats {
			grid-template-columns: 1fr;
		}

		.dashboard-header {
			flex-direction: column;
			gap: 1rem;
		}

		.section-title {
			flex-direction: column;
			gap: 0.25rem;
		}
	}
</style>
