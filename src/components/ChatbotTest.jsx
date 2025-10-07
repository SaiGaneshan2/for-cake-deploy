import React, { useState } from 'react';
import { GROQ_CONFIG } from '../config/groq';

// Simple test component to verify Groq API integration
const ChatbotTest = () => {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async () => {
    setIsLoading(true);
    setTestResult('Testing API connection...');
    
    try {
      const response = await fetch(GROQ_CONFIG.BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_CONFIG.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_CONFIG.MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful SQL assistant. Keep responses brief.'
            },
            {
              role: 'user',
              content: 'What is a SELECT statement in SQL?'
            }
          ],
          max_tokens: 200,
          temperature: 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTestResult(`✅ API Test Successful!\n\nResponse: ${data.choices[0].message.content}`);
    } catch (error) {
      setTestResult(`❌ API Test Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-2">SQL Chatbot API Test</h3>
      <button
        onClick={testAPI}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test API Connection'}
      </button>
      {testResult && (
        <div className="mt-4 p-3 bg-white rounded border">
          <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default ChatbotTest;
