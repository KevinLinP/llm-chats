import { db } from '../lib/db.js';
import { FieldValue } from 'firebase-admin/firestore';
const LIMIT = 1000;

async function deleteProperty(property) {
  const snapshot = await db.collection('threads')
    .orderBy('createdAt', 'desc')
    .limit(LIMIT)
    .get();
  
  let documentsChecked = 0;
  let documentsUpdated = 0;
  
  for (const doc of snapshot.docs) {
    try {
      documentsChecked++;
      const data = doc.data();
      if (!data[property]) continue;

      // Update the document
      await doc.ref.update({
        [property]: FieldValue.delete()
      });
        
      documentsUpdated++;
    } catch (error) {
      console.error(`Error processing thread ${doc.id}:`, error);
    }
  }
  
  console.log(`Migration completed. Documents checked: ${documentsChecked}, Documents updated: ${documentsUpdated}`);
}

// Run the migration
deleteProperty('title')
    .then(() => console.log('Migration completed'))
    .catch(console.error);
