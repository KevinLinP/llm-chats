import { getUser } from './user';

export async function getYoutubeTranscript(videoUrlOrId) {
  const { youtubeTranscriptUrl, klptosAuthToken } = await getUser();

  const response = await fetch(youtubeTranscriptUrl, {
    method: 'POST',
    headers: {
      'Auth-Token': klptosAuthToken,
    },
    body: videoUrlOrId
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transcript');
  }

  return await response.text();
}
