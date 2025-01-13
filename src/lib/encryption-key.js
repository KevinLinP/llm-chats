import { printNewJwkKey } from './crypto';

const LOCAL_STORAGE_KEY = 'jwkEncryptionKey';
let key = null;

const populateKey = async () => {
  const jwk = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!jwk) {
    printNewJwkKey();
  }

  key = await window.crypto.subtle.importKey(
    'jwk',
    JSON.parse(jwk),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
};

populateKey();

export const getKey = () => key;

export const saveKey = (newJwk) => {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, newJwk);
};