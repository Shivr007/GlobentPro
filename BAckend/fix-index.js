// Script to fix MongoDB duplicate key error by removing problematic index
require('dotenv').config();
const { MongoClient } = require('mongodb');

// Get MongoDB connection string from environment variables
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in environment variables (.env file).');
  process.exit(1);
}

async function fixMongoDBIndex() {
  console.log('Connecting to MongoDB to fix index issue...');
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB successfully.');
    
    // Get database name from connection string
    const dbName = MONGO_URI.split('/').pop().split('?')[0];
    const db = client.db(dbName);
    
    // Get the quizzes collection
    const quizzesCollection = db.collection('quizzes');
    
    // List all indexes in the collection
    console.log('Listing current indexes on quizzes collection:');
    const indexes = await quizzesCollection.indexes();
    console.log(indexes);
    
    // Check if id_1 index exists
    const idIndexExists = indexes.some(index => index.name === 'id_1');
    
    if (idIndexExists) {
      console.log('Found problematic id_1 index. Dropping index...');
      await quizzesCollection.dropIndex('id_1');
      console.log('Successfully dropped id_1 index.');
    } else {
      console.log('No id_1 index found. Checking for other potential issues...');
      
      // If no id_1 index, check for other indexes that might be causing issues
      const problematicIndexes = indexes.filter(index => 
        index.name !== '_id_' && // Skip the default _id index
        index.name !== 'pin_1' && // Skip the intended unique pin index
        index.name !== 'createdBy_1' // Skip the intended createdBy index
      );
      
      if (problematicIndexes.length > 0) {
        console.log('Found other potentially problematic indexes:', problematicIndexes);
        
        for (const index of problematicIndexes) {
          console.log(`Dropping index: ${index.name}...`);
          await quizzesCollection.dropIndex(index.name);
          console.log(`Successfully dropped ${index.name} index.`);
        }
      } else {
        console.log('No problematic indexes found.');
      }
    }
    
    console.log('Index check and cleanup completed successfully.');
  } catch (error) {
    console.error('Error fixing MongoDB index:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the fix function
fixMongoDBIndex();