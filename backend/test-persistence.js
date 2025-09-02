const Y = require('yjs');
const { LeveldbPersistence } = require('y-leveldb');

async function testPersistence() {
  console.log('Testing LevelDB persistence...');
  
  // Initialize persistence
  const persistence = new LeveldbPersistence('./y-leveldb-documents');
  
  // Test document name (same format as frontend uses)
  const docName = 'test-room-123';
  
  // Create a new Y.js document
  const doc = new Y.Doc();
  const text = doc.getText('monaco');
  
  // Add some content
  text.insert(0, 'Hello from persistence test!\nThis content should persist after restart.\n');
  
  console.log('Document content:', text.toString());
  
  try {
    // Get the document state from persistence first
    const persistedState = await persistence.getYDoc(docName);
    if (persistedState && persistedState.size > 0) {
      console.log('Found existing document in persistence');
      Y.applyUpdate(doc, persistedState);
    }
    
    // Store the current document state
    const docState = Y.encodeStateAsUpdate(doc);
    await persistence.storeUpdate(docName, docState);
    
    console.log('Document stored to persistence successfully');
    
    // Test retrieving it
    const retrieved = await persistence.getYDoc(docName);
    console.log('Retrieved document size:', retrieved ? retrieved.length : 0);
    
  } catch (error) {
    console.error('Persistence test error:', error);
  }
  
  // Wait a moment for any async operations
  setTimeout(() => {
    console.log('Test complete. Document should be saved to LevelDB.');
    persistence.destroy();
    process.exit(0);
  }, 1000);
}

testPersistence().catch(console.error);
