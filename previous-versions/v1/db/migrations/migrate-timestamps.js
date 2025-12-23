import { db } from '../lib/db.js';
import { FieldValue } from 'firebase-admin/firestore';

async function migrateTimestamps() {
  const batchSize = 50;
  let processedCount = 0;
  let errorCount = 0;
  let updatedCount = 0;

  try {
    // Get all documents from the threads collection
    const threadsSnapshot = await db.collection('threads').get();
    console.log(`Found ${threadsSnapshot.size} documents to process`);

    // Process documents in batches
    for (let i = 0; i < threadsSnapshot.size; i += batchSize) {
      const batch = db.batch();
      const batchDocs = threadsSnapshot.docs.slice(i, i + batchSize);

      for (const doc of batchDocs) {
        const data = doc.data();
        
        // Only update if the old fields exist
        if (data.created || data.updated) {
          console.log(`Document ${doc.id} has old fields:`, {
            created: !!data.created,
            updated: !!data.updated
          });
          
          const updates = {};
          
          if (data.created) {
            updates.createdAt = data.created;
            updates.created = FieldValue.delete(); // Properly remove the field
          }
          
          if (data.updated) {
            updates.updatedAt = data.updated;
            updates.updated = FieldValue.delete(); // Properly remove the field
          }

          batch.update(doc.ref, updates);
          updatedCount++;
        }
      }

      // Commit the batch
      await batch.commit();
      processedCount += batchDocs.length;
      console.log(`Processed ${processedCount}/${threadsSnapshot.size} documents`);
    }

    console.log('Migration completed successfully!');
    console.log(`Total documents processed: ${processedCount}`);
    console.log(`Total documents updated: ${updatedCount}`);
    console.log(`Total errors: ${errorCount}`);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run the migration
migrateTimestamps()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
