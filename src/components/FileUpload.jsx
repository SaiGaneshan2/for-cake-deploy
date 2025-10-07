import React, { useState } from 'react';
import './FileUpload.css';
import QuestionEditor from './QuestionEditor';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [numLevels, setNumLevels] = useState(5);
  const [questionsPerLevel, setQuestionsPerLevel] = useState(3);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      console.log('No file selected');
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData object
      const formData = new FormData();
      
      // Append the selected file with the key 'document' to match backend expectations
      formData.append('document', selectedFile);
      
      // Append the quiz configuration values
      formData.append('numLevels', numLevels.toString());
      formData.append('questionsPerLevel', questionsPerLevel.toString());

      // Send POST request to the backend endpoint
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
        // Note: Do not set Content-Type header - browser will set it automatically with boundary
      });

      // Parse the JSON response
      const result = await response.json();

      // Log the result to console
      console.log('Server response:', result);

      if (response.ok) {
        console.log('File uploaded successfully!');
        console.log('Questions received:', result.questions);
        
        // Save the questions array to state
        setQuestions(result.questions);
        
        alert(`Success! Generated ${result.totalQuestions} questions from your document.`);
      } else {
        console.error('Upload failed:', result);
        alert('Upload failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Conditional rendering: Show QuestionEditor if questions exist
  if (questions) {
    return (
      <QuestionEditor 
        questions={questions} 
        numLevels={numLevels}
        questionsPerLevel={questionsPerLevel}
      />
    );
  }

  // Otherwise, show the file upload UI
  return (
    <div className="file-upload-container">
      <h1>Create a New Quiz</h1>
      <p>Upload a document (.txt, .pdf) to get started.</p>
      
      {/* Quiz Configuration Section */}
      <div className="config-section">
        <h3>Quiz Configuration</h3>
        
        <div className="config-field">
          <label htmlFor="numLevels">Number of Levels (1-10):</label>
          <input
            type="number"
            id="numLevels"
            min="1"
            max="10"
            value={numLevels}
            onChange={(e) => setNumLevels(parseInt(e.target.value) || 1)}
            className="config-input"
            disabled={isUploading}
          />
        </div>
        
        <div className="config-field">
          <label htmlFor="questionsPerLevel">Questions per Level:</label>
          <input
            type="number"
            id="questionsPerLevel"
            min="1"
            max="20"
            value={questionsPerLevel}
            onChange={(e) => setQuestionsPerLevel(parseInt(e.target.value) || 1)}
            className="config-input"
            disabled={isUploading}
          />
        </div>
      </div>
      
      <div className="file-input-wrapper">
        <input
          type="file"
          accept=".txt,.pdf"
          onChange={handleFileChange}
          id="file-upload"
          disabled={isUploading}
        />
        <label 
          htmlFor="file-upload" 
          className={`file-input-label ${isUploading ? 'disabled' : ''}`}
        >
          📁 Choose File
        </label>
        
        {selectedFile && (
          <p className="file-name">
            ✓ Selected: {selectedFile.name}
          </p>
        )}
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={!selectedFile || isUploading}
        className={`generate-button ${isUploading ? 'uploading' : ''}`}
      >
        {isUploading ? '⏳ Uploading...' : '🚀 Generate Questions'}
      </button>
    </div>
  );
};

export default FileUpload;
