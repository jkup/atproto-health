<script lang="ts">
	import { topLanguages } from '$lib/stores/jetstream';

	const languageNames: Record<string, string> = {
		en: 'English',
		ja: 'Japanese',
		pt: 'Portuguese',
		es: 'Spanish',
		de: 'German',
		fr: 'French',
		ko: 'Korean',
		zh: 'Chinese',
		it: 'Italian',
		nl: 'Dutch',
		ru: 'Russian',
		pl: 'Polish',
		tr: 'Turkish',
		ar: 'Arabic',
		th: 'Thai',
		vi: 'Vietnamese',
		id: 'Indonesian',
		uk: 'Ukrainian',
		cs: 'Czech',
		sv: 'Swedish'
	};

	function getLanguageName(code: string): string {
		return languageNames[code] || code.toUpperCase();
	}

	function getTotal(langs: [string, number][]): number {
		return langs.reduce((sum, [_, count]) => sum + count, 0);
	}
</script>

<div class="languages-card">
	<h3>Languages</h3>
	<div class="language-list">
		{#if $topLanguages.length === 0}
			<p class="empty-state">Collecting data...</p>
		{:else}
			{@const total = getTotal($topLanguages)}
			{#each $topLanguages as [lang, count]}
				{@const percentage = ((count / total) * 100).toFixed(1)}
				<div class="language-item">
					<div class="language-info">
						<span class="language-code">{lang}</span>
						<span class="language-name">{getLanguageName(lang)}</span>
					</div>
					<div class="language-bar-container">
						<div class="language-bar" style="width: {percentage}%"></div>
					</div>
					<span class="language-percentage">{percentage}%</span>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.languages-card {
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

	.language-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.empty-state {
		color: #64748b;
		font-size: 0.875rem;
		text-align: center;
		padding: 2rem 0;
	}

	.language-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.language-info {
		width: 100px;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.language-code {
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		background: rgba(59, 130, 246, 0.2);
		color: #60a5fa;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
	}

	.language-name {
		font-size: 0.75rem;
		color: #94a3b8;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.language-bar-container {
		flex: 1;
		height: 6px;
		background: rgba(148, 163, 184, 0.1);
		border-radius: 3px;
		overflow: hidden;
	}

	.language-bar {
		height: 100%;
		background: linear-gradient(90deg, #3b82f6, #8b5cf6);
		border-radius: 3px;
		transition: width 0.3s ease;
	}

	.language-percentage {
		font-size: 0.75rem;
		color: #64748b;
		width: 3rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
</style>
