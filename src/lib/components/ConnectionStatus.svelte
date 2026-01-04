<script lang="ts">
	import { isConnected, eventsPerSecond } from '$lib/stores/jetstream';
</script>

<div class="connection-status" class:connected={$isConnected}>
	<span class="status-dot"></span>
	<span class="status-text">
		{#if $isConnected}
			Connected to Jetstream
		{:else}
			Connecting...
		{/if}
	</span>
	{#if $isConnected}
		<span class="events-rate">{$eventsPerSecond.toLocaleString()} events/sec</span>
	{/if}
</div>

<style>
	.connection-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: #64748b;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #ef4444;
		animation: pulse 2s infinite;
	}

	.connected .status-dot {
		background: #22c55e;
		animation: none;
	}

	.status-text {
		color: #94a3b8;
	}

	.events-rate {
		background: rgba(34, 197, 94, 0.1);
		color: #22c55e;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>
