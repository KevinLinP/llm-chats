import { db } from '../lib/db.js';
import { decrypt, encrypt } from '../lib/crypto.js';

async function migrateChatCompletions() {
  // Calculate date 6 months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  // Get threads created less than 6 months ago
  const snapshot = await db.collection('threads')
    .where('createdAt', '>', sixMonthsAgo)
    .get();
  
  let documentsChecked = 0;
  let documentsUpdated = 0;
  
  for (const doc of snapshot.docs) {
    try {
      documentsChecked++;
      // Decrypt the thread
      const decryptedThread = await decrypt({ thread: doc });

      // Check if chatCompletion exists
      if ('chatCompletions' in decryptedThread) {
        // Remove chatCompletion field
        const { chatCompletions, ...threadWithoutChatCompletions } = decryptedThread;
        
        // Re-encrypt the data without chatCompletion
        const encryptedData = await encrypt(threadWithoutChatCompletions);
        
        // Update the document
        await doc.ref.update({
          iv: encryptedData.iv,
          encrypted: encryptedData.encrypted
        });
        
        documentsUpdated++;
        console.log(`Successfully migrated thread: ${doc.id}`);
      }
    } catch (error) {
      console.error(`Error processing thread ${doc.id}:`, error);
    }
  }
  
  console.log(`Migration completed. Documents checked: ${documentsChecked}, Documents updated: ${documentsUpdated}`);
}

// Run the migration
migrateChatCompletions()
    .then(() => console.log('Migration completed'))
    .catch(console.error);
