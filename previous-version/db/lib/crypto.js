import crypto from 'crypto';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ESM
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Reads and parses the encryption key from the secret file
 * @returns {Buffer} The encryption key buffer
 */
function readEncryptionKey() {
    const keyPath = join(__dirname, 'encryption-key.secret.json');
    const jwk = JSON.parse(readFileSync(keyPath, 'utf8'));
    return Buffer.from(jwk.k, 'base64');
}

/**
 * Decrypts data using AES-GCM
 * @param {Object} params
 * @param {Object} params.thread - The thread object containing encrypted data
 * @returns {Promise<Object>} Decrypted thread data
 */
export const decrypt = async ({ thread }) => {
    // Get the encryption key
    const keyBuffer = readEncryptionKey();
    
    // Get the IV and encrypted data from the thread
    // Assuming thread.data().iv and thread.data().encrypted are Buffer or can be converted to Buffer
    const iv = Buffer.from(thread.data().iv);
    const encrypted = Buffer.from(thread.data().encrypted);

    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);

    // Get the auth tag (last 16 bytes of encrypted data)
    const authTag = encrypted.slice(-16);
    const encryptedContent = encrypted.slice(0, -16);

    // Set auth tag
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(encryptedContent, null, 'utf8');
    decrypted += decipher.final('utf8');

    // Parse the decrypted JSON string
    const decryptedData = JSON.parse(decrypted);

    return {
        id: thread.id,
        ...decryptedData
    };
};

/**
 * Encrypts data using AES-GCM
 * @param {Object} data - The data to encrypt
 * @returns {Promise<Object>} Object containing iv and encrypted data
 */
export const encrypt = async (data) => {
    const keyBuffer = readEncryptionKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Get and concatenate auth tag
    const authTag = cipher.getAuthTag();
    const encryptedWithAuthTag = Buffer.concat([encrypted, authTag]);
    
    return {
        iv: iv,
        encrypted: encryptedWithAuthTag
    };
};
