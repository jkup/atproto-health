<script lang="ts">
	import { topHashtags } from '$lib/stores/jetstream';
</script>

<div class="hashtags-card">
	<h3>Trending Hashtags</h3>
	<div class="hashtag-list">
		{#if $topHashtags.length === 0}
			<p class="empty-state">Collecting data...</p>
		{:else}
			{#each $topHashtags as [tag, count], i}
				<div class="hashtag-item">
					<span class="hashtag-rank">#{i + 1}</span>
					<span class="hashtag-tag">{tag}</span>
					<span class="hashtag-count">{count.toLocaleString()}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.hashtags-card {
		background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
		border: 1px solid rgba(148, 163, 184, 0.1);
		border-radius: 12px;
		padding: 1.25rem;
	}

	h3 {
		font-size: 0.875rem;
		font-weight: 600;
		color: #f1f5f9;
		margin: 0 0 1rem 0;
	}

	.hashtag-list {
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

	.hashtag-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid rgba(148, 163, 184, 0.1);
	}

	.hashtag-item:last-child {
		border-bottom: none;
	}

	.hashtag-rank {
		font-size: 0.75rem;
		color: #64748b;
		width: 1.5rem;
	}

	.hashtag-tag {
		flex: 1;
		font-size: 0.875rem;
		color: #3b82f6;
		font-weight: 500;
	}

	.hashtag-count {
		font-size: 0.75rem;
		color: #94a3b8;
		font-variant-numeric: tabular-nums;
	}
</style>
