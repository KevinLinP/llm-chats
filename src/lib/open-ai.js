import OpenAI from 'openai';

import { getUser } from './user.js';

export const getOpenAi = async () => {
  const user = await getUser();
  if (!user) return null;

  return new OpenAI({ dangerouslyAllowBrowser: true, apiKey: user.openAi?.apiKey });
};