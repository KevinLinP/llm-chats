import { getUser } from './user';

export async function get_youtube_transcript(video_url_or_id) {
  const { youtubeTranscriptUrl, klptosAuthToken } = await getUser();

  const response = await fetch(youtubeTranscriptUrl, {
    method: 'POST',
    headers: {
      'Auth-Token': klptosAuthToken,
    },
    body: video_url_or_id
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transcript');
  }

  return await response.text();
}
