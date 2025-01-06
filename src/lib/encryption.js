// import { printNewJwkKey } from './utils/crypto.js';

// const localStorage = window.localStorage;
// const localStorageKey = 'base64EncryptionKey';
// let encryptionKey = $state(null);

// const restoreKey = async () => {
//   const jwk = localStorage.getItem(localStorageKey);
//   if (!jwk) return;

//   const key = await window.crypto.subtle.importKey(
//     'jwk',
//     JSON.parse(jwk),
//     { name: 'AES-GCM' },
//     false,
//     ['encrypt', 'decrypt']
//   );

//   encryptionKey = key;
// };

// const run = async () => {
//   await restoreKey();

//   if (!encryptionKey) {
//     printNewJwkKey();
//   }
// };

// run();

// const saveKey = () => {
//   localStorage.setItem(localStorageKey, newKey);
// };