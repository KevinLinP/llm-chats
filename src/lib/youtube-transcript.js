import { YoutubeTranscript } from 'youtube-transcript';

export async function getYoutubeTranscript(videoUrlOrId) {
  const transcript = await YoutubeTranscript.fetchTranscript(videoUrlOrId);
  const text = transcript.map(({ text }) => text).join(' ');
  const decoder = new DOMParser().parseFromString('<!doctype html><body>' + text, 'text/html').body.textContent;

  return decoder;
}
