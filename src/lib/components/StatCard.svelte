<script lang="ts">
	interface Props {
		title: string;
		value: string | number;
		subtitle?: string;
		color?: string;
		icon?: string;
	}

	let { title, value, subtitle = '', color = '#3b82f6', icon = '' }: Props = $props();
</script>

<div class="stat-card" style="--accent-color: {color}">
	<div class="stat-header">
		{#if icon}
			<span class="stat-icon">{icon}</span>
		{/if}
		<span class="stat-title">{title}</span>
	</div>
	<div class="stat-value">{value}</div>
	{#if subtitle}
		<div class="stat-subtitle">{subtitle}</div>
	{/if}
</div>

<style>
	.stat-card {
		background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
		border: 1px solid rgba(148, 163, 184, 0.1);
		border-radius: 12px;
		padding: 1.25rem;
		position: relative;
		overflow: hidden;
	}

	.stat-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: var(--accent-color);
	}

	.stat-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.stat-icon {
		font-size: 1.25rem;
	}

	.stat-title {
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #94a3b8;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: #f1f5f9;
		font-variant-numeric: tabular-nums;
		line-height: 1.2;
	}

	.stat-subtitle {
		font-size: 0.75rem;
		color: #64748b;
		margin-top: 0.25rem;
	}
</style>
