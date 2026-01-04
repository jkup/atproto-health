<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import { chartData } from '$lib/stores/history';

	Chart.register(...registerables);

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const collectionLabels: Record<string, string> = {
			'Post': 'app.bsky.feed.post',
			'Like': 'app.bsky.feed.like',
			'Repost': 'app.bsky.feed.repost',
			'Follow': 'app.bsky.graph.follow'
		};

		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: [],
				datasets: [
					{
						label: 'Post',
						data: [],
						borderColor: '#3b82f6',
						backgroundColor: 'rgba(59, 130, 246, 0.1)',
						fill: true,
						tension: 0.4,
						borderWidth: 2,
						pointRadius: 0
					},
					{
						label: 'Like',
						data: [],
						borderColor: '#ef4444',
						backgroundColor: 'rgba(239, 68, 68, 0.1)',
						fill: true,
						tension: 0.4,
						borderWidth: 2,
						pointRadius: 0
					},
					{
						label: 'Repost',
						data: [],
						borderColor: '#22c55e',
						backgroundColor: 'rgba(34, 197, 94, 0.1)',
						fill: true,
						tension: 0.4,
						borderWidth: 2,
						pointRadius: 0
					},
					{
						label: 'Follow',
						data: [],
						borderColor: '#a855f7',
						backgroundColor: 'rgba(168, 85, 247, 0.1)',
						fill: true,
						tension: 0.4,
						borderWidth: 2,
						pointRadius: 0
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: {
					duration: 0
				},
				interaction: {
					intersect: false,
					mode: 'index'
				},
				plugins: {
					legend: {
						position: 'top',
						labels: {
							color: '#94a3b8',
							usePointStyle: true,
							pointStyle: 'circle',
							padding: 20
						}
					},
					tooltip: {
						backgroundColor: 'rgba(15, 23, 42, 0.9)',
						titleColor: '#f1f5f9',
						bodyColor: '#94a3b8',
						borderColor: 'rgba(148, 163, 184, 0.2)',
						borderWidth: 1,
						padding: 12,
						displayColors: true,
						usePointStyle: true,
						callbacks: {
							label: function(context) {
								const label = context.dataset.label || '';
								const collection = collectionLabels[label] || '';
								const value = context.parsed.y;
								return `${collection}: ${value}/sec`;
							}
						}
					}
				},
				scales: {
					x: {
						grid: {
							color: 'rgba(148, 163, 184, 0.1)'
						},
						ticks: {
							color: '#64748b',
							maxTicksLimit: 10
						}
					},
					y: {
						beginAtZero: true,
						grid: {
							color: 'rgba(148, 163, 184, 0.1)'
						},
						ticks: {
							color: '#64748b'
						}
					}
				}
			}
		});
	});

	// Update chart when data changes
	$effect(() => {
		if (chart && $chartData.labels.length > 0) {
			chart.data.labels = $chartData.labels;
			chart.data.datasets[0].data = $chartData.posts;
			chart.data.datasets[1].data = $chartData.likes;
			chart.data.datasets[2].data = $chartData.reposts;
			chart.data.datasets[3].data = $chartData.follows;
			chart.update('none');
		}
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
		}
	});
</script>

<div class="chart-container">
	<h3>Bluesky Record Activity <span class="chart-subtitle">app.bsky.* records/sec over time</span></h3>
	<div class="chart-wrapper">
		<canvas bind:this={canvas}></canvas>
	</div>
</div>

<style>
	.chart-container {
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

	.chart-subtitle {
		font-size: 0.7rem;
		font-weight: 400;
		color: #64748b;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
		margin-left: 0.5rem;
	}

	.chart-wrapper {
		height: 250px;
		position: relative;
	}
</style>
