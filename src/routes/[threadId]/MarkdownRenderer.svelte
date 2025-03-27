<script>
	import { marked } from 'marked';

	let { content } = $props();
	
	function renderMarkdown(text) {
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

<div class="markdown-content">
	{@html renderMarkdown(content)}
</div>

<style>
	.markdown-content :global(h1) {
		font-size: 1.5rem;
		font-weight: bold;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}
	
	.markdown-content :global(h2) {
		font-size: 1.25rem;
		font-weight: bold;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}
	
	.markdown-content :global(h3) {
		font-size: 1.125rem;
		font-weight: bold;
		margin-top: 0.75rem;
		margin-bottom: 0.5rem;
	}
	
	.markdown-content :global(p) {
		margin-bottom: 0.75rem;
	}
	
	.markdown-content :global(ul), 
	.markdown-content :global(ol) {
		margin-left: 1.5rem;
		margin-bottom: 0.75rem;
	}
	
	.markdown-content :global(ul) {
		list-style-type: disc;
	}
	
	.markdown-content :global(ol) {
		list-style-type: decimal;
	}
	
	.markdown-content :global(li) {
		margin-bottom: 0.25rem;
	}
	
	.markdown-content :global(code) {
		font-family: monospace;
		background-color: rgba(0, 0, 0, 0.05);
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
	}
	
	.markdown-content :global(pre) {
		background-color: rgba(0, 0, 0, 0.05);
		padding: 0.5rem;
		border-radius: 0.25rem;
		margin-bottom: 0.75rem;
		overflow-x: auto;
	}
	
	.markdown-content :global(pre code) {
		background-color: transparent;
		padding: 0;
	}
	
	.markdown-content :global(blockquote) {
		border-left: 4px solid #ccc;
		padding-left: 1rem;
		margin-left: 0;
		margin-bottom: 0.75rem;
	}
	
	.markdown-content :global(a) {
		color: #2563eb;
		text-decoration: underline;
	}
	
	.markdown-content :global(table) {
		border-collapse: collapse;
		margin-bottom: 1rem;
		width: 100%;
	}
	
	.markdown-content :global(th), 
	.markdown-content :global(td) {
		border: 1px solid #ddd;
		padding: 0.5rem;
	}
	
	.markdown-content :global(th) {
		background-color: rgba(0, 0, 0, 0.05);
		font-weight: bold;
	}
</style>