<script lang="ts">
	import { marked } from 'marked';

	let { content }: { content: string } = $props();

	function renderMarkdown(text: string): string {
		try {
			// Parse markdown to HTML
			return marked.parse(text || '');
		} catch (e) {
			console.error('Markdown parsing error:', e);
			// Fallback to plain text if parsing fails
			return `<pre class="whitespace-pre-wrap font-sans">${text}</pre>`;
		}
	}
</script>

<div class="prose prose-invert max-w-none markdown-content">
	{@html renderMarkdown(content)}
</div>

<style>
	/* Use Tailwind typography for base styling, with custom overrides for dark mode compatibility */
	.markdown-content :global(code) {
		background-color: rgba(255, 255, 255, 0.1);
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
	}

	.markdown-content :global(pre code) {
		background-color: transparent;
		padding: 0;
	}

	.markdown-content :global(blockquote) {
		border-left: 4px solid rgba(255, 255, 255, 0.3);
	}

	.markdown-content :global(a) {
		color: #60a5fa;
	}
</style>

