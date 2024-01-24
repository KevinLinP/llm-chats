export const generateJwkKey = async () => {
  const key = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  )

  const jwkKey = await window.crypto.subtle.exportKey('jwk', key);

  console.log(JSON.stringify(jwkKey));
}