const fs = require('fs');
const path = require('path');
const Y = require('yjs');
const logger = require('./logger');

class DocumentPersistence {
  constructor() {
    this.docsDir = path.join(__dirname, '..', 'docs');
    this.ensureDocsDirectory();
    this.docs = new Map(); // In-memory document store
  }

  ensureDocsDirectory() {
    if (!fs.existsSync(this.docsDir)) {
      fs.mkdirSync(this.docsDir, { recursive: true });
      logger.info('Created docs directory:', this.docsDir);
    }
  }

  getDocumentPath(docName) {
    return path.join(this.docsDir, `${docName}.yjs`);
  }

  loadDocument(docName) {
    try {
      const docPath = this.getDocumentPath(docName);
      
      if (fs.existsSync(docPath)) {
        const data = fs.readFileSync(docPath);
        const ydoc = new Y.Doc();
        Y.applyUpdate(ydoc, data);
        logger.info(`Loaded document: ${docName} (${data.length} bytes)`);
        return ydoc;
      } else {
        logger.info(`Creating new document: ${docName}`);
        return new Y.Doc();
      }
    } catch (error) {
      logger.error(`Error loading document ${docName}:`, error);
      return new Y.Doc();
    }
  }

  saveDocument(docName, ydoc) {
    try {
      const docPath = this.getDocumentPath(docName);
      const update = Y.encodeStateAsUpdate(ydoc);
      fs.writeFileSync(docPath, update);
      logger.info(`Saved document: ${docName} (${update.length} bytes)`);
    } catch (error) {
      logger.error(`Error saving document ${docName}:`, error);
    }
  }

  getOrCreateDocument(docName) {
    if (this.docs.has(docName)) {
      return this.docs.get(docName);
    }

    const ydoc = this.loadDocument(docName);
    this.docs.set(docName, ydoc);

    // Set up auto-save every 10 seconds
    const saveInterval = setInterval(() => {
      this.saveDocument(docName, ydoc);
    }, 10000);

    // Clean up when document is no longer needed
    ydoc.on('destroy', () => {
      clearInterval(saveInterval);
      this.docs.delete(docName);
      logger.info(`Document ${docName} destroyed, cleanup completed`);
    });

    return ydoc;
  }

  // Manual save trigger
  saveDocumentNow(docName) {
    const ydoc = this.docs.get(docName);
    if (ydoc) {
      this.saveDocument(docName, ydoc);
    }
  }

  // Get document statistics
  getStats() {
    return {
      activeDocuments: this.docs.size,
      documents: Array.from(this.docs.keys())
    };
  }
}

module.exports = DocumentPersistence;
