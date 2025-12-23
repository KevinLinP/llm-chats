<script lang="ts">
	import { marked } from 'marked';
	import { onMount } from 'svelte';

	let { content, citations, messageId }: { content: string; citations?: Record<string, string>; messageId?: string } = $props();

	let containerElement: HTMLDivElement | null = $state(null);

	function renderMarkdown(text: string): string {
		try {
			// Parse markdown to HTML
			let html = marked.parse(text || '');
			
			// Replace citation markers [1], [2], etc. with clickable links if citations are provided
			if (citations && messageId) {
				html = html.replace(/(\[\d+\])/g, (match) => {
					const number = match.slice(1, -1); // Extract number from [N]
					const url = citations[number];
					if (url) {
						return `<a href="#citation-${messageId}-${number}" data-citation-number="${number}" class="citation-link text-sm px-0.5 mx-0.5 rounded-md bg-gray-600" style="color: #F0F0F0; text-decoration: none; cursor: pointer;">${number}</a>`;
					}
					return match; // Return original if citation not found
				});
			} else if (citations) {
				// Fallback to external links if no messageId provided
				html = html.replace(/(\[\d+\])/g, (match) => {
					const number = match.slice(1, -1);
					const url = citations[number];
					if (url) {
						return `<a href="${url}" target="_blank" class="text-sm px-0.5 mx-0.5 rounded-md bg-gray-600" style="color: #F0F0F0; text-decoration: none;">${number}</a>`;
					}
					return match;
				});
			}
			
			return html;
		} catch (e) {
			console.error('Markdown parsing error:', e);
			// Fallback to plain text if parsing fails
			return `<pre class="whitespace-pre-wrap font-sans">${text}</pre>`;
		}
	}

	function handleCitationClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const citationLink = target.closest('.citation-link') as HTMLAnchorElement;
		
		if (citationLink && messageId) {
			event.preventDefault();
			const citationNumber = citationLink.getAttribute('data-citation-number');
			if (citationNumber) {
				const citationId = `citation-${messageId}-${citationNumber}`;
				const citationElement = document.getElementById(citationId);
				
				if (citationElement) {
					// Scroll to the citation
					citationElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
					
					// Highlight the citation
					citationElement.classList.add('citation-highlight');
					setTimeout(() => {
						citationElement.classList.remove('citation-highlight');
					}, 2000);
				}
			}
		}
	}

	onMount(() => {
		if (containerElement) {
			containerElement.addEventListener('click', handleCitationClick);
			return () => {
				containerElement?.removeEventListener('click', handleCitationClick);
			};
		}
	});
</script>

<div class="prose prose-invert max-w-none markdown-content" bind:this={containerElement}>
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

	:global(.citation-highlight) {
		background-color: rgba(59, 130, 246, 0.3);
		transition: background-color 0.3s ease;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		animation: highlight-fade 2s ease-out;
	}

	@keyframes highlight-fade {
		0% {
			background-color: rgba(59, 130, 246, 0.5);
		}
		100% {
			background-color: transparent;
		}
	}
</style>

