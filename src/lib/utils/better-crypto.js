// export const generateKey = async ({ usage }) => {
//   return await window.crypto.subtle.generateKey(
//     {
//       name: 'AES-GCM',
//       length: 256
//     },
//     true,
//     usage
//   )
// }

// function uint8ArrayToBase64 (uint8Array) {
//   const string = String.fromCharCode.apply(null, uint8Array)
//   const base64 = btoa(string)
//   return base64
// }

// function arrayBufferToBase64 (buffer) {
//   const uint8Array = new Uint8Array(buffer)
//   return uint8ArrayToBase64(uint8Array)
// }

// const exportKey = async ({ encryptionKey, wrapperKey }) => {
//   const iv = window.crypto.getRandomValues(new Uint8Array(12))
//   const wrappedKey = await window.crypto.subtle.wrapKey(
//     'raw',
//     encryptionKey,
//     wrapperKey,
//     { name: 'AES-GCM', iv }
//   )

//   const base64Iv = uint8ArrayToBase64(iv)
//   const base64WrappedKey = arrayBufferToBase64(wrappedKey)

//   return { base64Iv, base64WrappedKey }
// }

// function base64ToArrayBuffer (base64) {
//   const binaryString = window.atob(base64)
//   const len = binaryString.length
//   const bytes = new Uint8Array(len)
//   for (let i = 0; i < len; i++) {
//     bytes[i] = binaryString.charCodeAt(i)
//   }
//   return bytes.buffer
// }

// const unwrapKey = async ({ wrappedKey, wrapperKey }) => {
//   const iv = base64ToArrayBuffer(wrappedKey.base64Iv)
//   const key = base64ToArrayBuffer(wrappedKey.base64WrappedKey)

//   return await window.crypto.subtle.unwrapKey(
//     'raw',
//     key,
//     wrapperKey,
//     { name: 'AES-GCM', iv },
//     { name: 'AES-GCM', length: 256 },
//     true,
//     ['encrypt', 'decrypt']
//   )
// }

// export const setupCrypto = async () => {
//   const encryptionKey = await generateKey({ usage: ['encrypt', 'decrypt'] })
//   const wrapperKey = await generateKey({ usage: ['wrapKey', 'unwrapKey'] })

//   const encryptionKeyRaw = await window.crypto.subtle.exportKey('raw', encryptionKey)

//   const wrappedKey = await exportKey({ encryptionKey, wrapperKey })
//   const unwrappedKey = await unwrapKey({ wrappedKey, wrapperKey })

//   console.log(wrappedKey)
//   console.log(unwrappedKey)

//   const unwrappedKeyRaw = await window.crypto.subtle.exportKey('raw', unwrappedKey)

//   console.log(arrayBufferToBase64(encryptionKeyRaw), arrayBufferToBase64(unwrappedKeyRaw))
// }
