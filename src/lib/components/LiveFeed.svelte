<script lang="ts">
	import { recentPosts } from '$lib/stores/jetstream';

	function formatTime(date: Date): string {
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}
</script>

<div class="live-feed">
	<div class="feed-header">
		<h3>Live Posts</h3>
		<span class="live-indicator">
			<span class="live-dot"></span>
			LIVE
		</span>
	</div>
	<div class="feed-list">
		{#if $recentPosts.length === 0}
			<p class="empty-state">Waiting for posts...</p>
		{:else}
			{#each $recentPosts as post (post.time.getTime() + post.handle)}
				<div class="feed-item">
					<span class="feed-time">{formatTime(post.time)}</span>
					<span class="feed-text">{post.text}{post.text.length >= 100 ? '...' : ''}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.live-feed {
		background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
		border: 1px solid rgba(148, 163, 184, 0.1);
		border-radius: 12px;
		padding: 1.25rem;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.feed-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	h3 {
		font-size: 0.875rem;
		font-weight: 600;
		color: #f1f5f9;
		margin: 0;
	}

	.live-indicator {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.625rem;
		font-weight: 700;
		color: #ef4444;
		letter-spacing: 0.05em;
	}

	.live-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #ef4444;
		animation: pulse 1.5s infinite;
	}

	.feed-list {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.empty-state {
		color: #64748b;
		font-size: 0.875rem;
		text-align: center;
		padding: 2rem 0;
	}

	.feed-item {
		display: flex;
		gap: 0.75rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid rgba(148, 163, 184, 0.05);
		animation: slideIn 0.3s ease;
	}

	.feed-time {
		font-size: 0.625rem;
		color: #64748b;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.feed-text {
		font-size: 0.75rem;
		color: #cbd5e1;
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
