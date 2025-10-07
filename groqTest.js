// groqTest.js
// Standalone test for Groq API connectivity

import fetch from 'node-fetch';

const API_KEY = process.env.GROQ_API_KEY || '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';

async function testGroqChatbot() {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful SQL tutor.' },
        { role: 'user', content: 'Help me understand basic SELECT statements.' }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Groq API error:', text);
    return;
  }

  const data = await response.json();
  console.log('Groq API response:', JSON.stringify(data, null, 2));
}

testGroqChatbot();
