import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { CollaborationManager } from '../utils/collaboration';

const CodeEditor = ({ roomId, onCollaborationReady, onUsersChange }) => {
  const editorRef = useRef(null);
  const collaborationRef = useRef(null);
  const templateSetRef = useRef(false); // Track if template has been set

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure Monaco
    monaco.editor.defineTheme('collaborative-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1a1a1a',
      }
    });
    
    monaco.editor.setTheme('collaborative-dark');
    
    const defaultContent = `// Welcome to Cursor: Collaborative IDE!
// Room: ${roomId}
// Share this URL with others to collaborate in real-time

function welcome() {
  console.log("Hello, collaborative world!");
  
  // Start coding together...
}

welcome();`;

    // Initialize collaboration first without setting template
    try {
      collaborationRef.current = new CollaborationManager(
        roomId,
        editor,
        onUsersChange,
        (isEmpty, yContent) => {
          console.log('Collaboration sync callback - isEmpty:', isEmpty, 'yContentLength:', yContent?.length || 0, 'templateSet:', templateSetRef.current);
          
          if (isEmpty && !templateSetRef.current) {
            // Y.js document is truly empty and we haven't set template yet
            console.log('Setting template for the first time');
            editor.setValue(defaultContent);
            // Double-check that Y.js is still empty before inserting
            const currentYContent = collaborationRef.current.ytext.toString();
            if (!currentYContent || currentYContent.trim() === '') {
              collaborationRef.current.ytext.insert(0, defaultContent);
            }
            templateSetRef.current = true;
          } else if (!isEmpty) {
            // Y.js has content, use it and prevent template
            console.log('Y.js has existing content, using it');
            editor.setValue(yContent);
            templateSetRef.current = true;
          } else if (isEmpty && templateSetRef.current) {
            // Template already set, just ensure editor has content
            console.log('Template already set, ensuring editor has content');
            if (!editor.getValue() || editor.getValue().trim() === '') {
              editor.setValue(defaultContent);
            }
          }
        }
      );
      
      if (onCollaborationReady) {
        onCollaborationReady(collaborationRef.current);
      }
    } catch (error) {
      console.error('Failed to initialize collaboration:', error);
      // Fallback: set template if collaboration fails
      if (!templateSetRef.current) {
        editor.setValue(defaultContent);
        templateSetRef.current = true;
      }
    }
  };

  useEffect(() => {
    return () => {
      if (collaborationRef.current) {
        collaborationRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="javascript"
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true
          },
          // Better collaboration options
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: true,
          smoothScrolling: true,
          // Disable features that can interfere with collaboration
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          tabCompletion: 'on',
          // Ensure consistent formatting
          insertSpaces: true,
          tabSize: 2,
          detectIndentation: false
        }}
      />
    </div>
  );
};

export default CodeEditor;