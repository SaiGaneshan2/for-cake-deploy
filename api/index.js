import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// In-memory database
const quizzes = {};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.txt', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt and .pdf files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Helper functions and routes from server.js
function splitTextIntoChunks(text, chunkSize = 30000) {
  const chunks = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex < text.length) {
      const remainingText = text.substring(startIndex, endIndex);
      const lastPeriod = remainingText.lastIndexOf('. ');
      const lastExclamation = remainingText.lastIndexOf('! ');
      const lastQuestion = remainingText.lastIndexOf('? ');
      
      const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
      
      if (lastSentenceEnd > chunkSize * 0.7) {
        endIndex = startIndex + lastSentenceEnd + 2;
      } else {
        const lastNewline = remainingText.lastIndexOf('\n\n');
        if (lastNewline > chunkSize * 0.5) {
          endIndex = startIndex + lastNewline + 2;
        } else {
          const lastSpace = remainingText.lastIndexOf(' ');
          if (lastSpace > chunkSize * 0.5) {
            endIndex = startIndex + lastSpace + 1;
          }
        }
      }
    }

    const chunk = text.substring(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    startIndex = endIndex;
  }

  return chunks;
}

function generateRoomCode() {
  let roomCode;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    roomCode = Math.floor(100000 + Math.random() * 900000).toString();
    attempts++;

    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique room code after maximum attempts');
    }
  } while (quizzes[roomCode]);

  return roomCode;
}

async function generateMCQs(documentText, questionsToGenerate = 3) {
  const apiKey = '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';
  
  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY');
  }

  try {
    const systemPrompt = `You are an expert educational content creator...`; // Truncated for brevity

    const userPrompt = `Please analyze the following document text and generate EXACTLY ${questionsToGenerate} high-quality multiple choice questions...`; // Truncated for brevity

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      throw new Error(`Groq API error: ${groqResponse.status} - ${errorText}`);
    }

    const data = await groqResponse.json();
    const aiResponse = data.choices[0].message.content;

    let mcqs;
    try {
      mcqs = JSON.parse(aiResponse);
    } catch (parseError) {
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        mcqs = JSON.parse(jsonMatch[1]);
      } else {
        const arrayMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          mcqs = JSON.parse(arrayMatch[0]);
        } else {
          throw new Error('Could not extract valid JSON from AI response');
        }
      }
    }

    if (!Array.isArray(mcqs)) {
      throw new Error('Response is not an array');
    }

    mcqs.forEach((mcq, index) => {
      if (!mcq.question || typeof mcq.question !== 'string') {
        throw new Error(`Question ${index + 1} is missing or invalid`);
      }
      if (!Array.isArray(mcq.options) || mcq.options.length !== 4) {
        throw new Error(`Question ${index + 1} must have exactly 4 options`);
      }
      if (!mcq.correctAnswer || !mcq.options.includes(mcq.correctAnswer)) {
        throw new Error(`Question ${index + 1} has invalid correctAnswer`);
      }
    });

    return mcqs;

  } catch (error) {
    console.error('Error in generateMCQs:', error);
    throw error;
  }
}

app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const numLevels = parseInt(req.body.numLevels) || 5;
    const questionsPerLevel = parseInt(req.body.questionsPerLevel) || 3;
    const totalQuestionsNeeded = numLevels * questionsPerLevel;

    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (req.file.mimetype === 'text/plain') {
      extractedText = fs.readFileSync(req.file.path, 'utf8');
    } else {
      extractedText = fs.readFileSync(req.file.path, 'utf8');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ 
        error: 'No text could be extracted from the file',
        details: 'The file appears to be empty or contains no readable text'
      });
    }

    const chunks = splitTextIntoChunks(extractedText, 30000);
    
    const allQuestions = [];
    
    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index];
      
      if (allQuestions.length >= totalQuestionsNeeded) {
        break;
      }
      
      const questionsStillNeeded = totalQuestionsNeeded - allQuestions.length;
      
      try {
        const questions = await generateMCQs(chunk, questionsStillNeeded);
        allQuestions.push(...questions);
        
        if (allQuestions.length >= totalQuestionsNeeded) {
          break;
        }
        
        if (index < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Chunk ${index + 1} failed:`, error.message);
      }
    }
    
    const finalQuestions = allQuestions.slice(0, totalQuestionsNeeded);

    return res.status(200).json({
      success: true,
      message: 'Questions generated successfully',
      fileInfo: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        textLength: extractedText.length,
        chunksProcessed: chunks.length
      },
      config: {
        numLevels: numLevels,
        questionsPerLevel: questionsPerLevel,
        totalQuestionsNeeded: totalQuestionsNeeded
      },
      questions: finalQuestions,
      totalQuestions: finalQuestions.length
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Error processing file and generating questions', 
      details: error.message 
    });
  }
});

app.post('/api/quiz', (req, res) => {
  try {
    const { questions, numLevels, questionsPerLevel } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ 
        error: 'Invalid request',
        details: 'Questions array is required' 
      });
    }

    if (questions.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request',
        details: 'Quiz must contain at least one question' 
      });
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
        return res.status(400).json({ 
          error: 'Invalid question format',
          details: `Question ${i + 1} is missing required fields or has invalid structure` 
        });
      }
    }

    const roomCode = generateRoomCode();

    quizzes[roomCode] = {
      questions: questions,
      numLevels: numLevels || Math.ceil(questions.length / 3),
      questionsPerLevel: questionsPerLevel || 3,
      createdAt: new Date().toISOString(),
      totalQuestions: questions.length
    };

    return res.status(200).json({
      success: true,
      roomCode: roomCode,
      message: `Quiz saved successfully with ${questions.length} questions`,
      totalQuestions: questions.length
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Error saving quiz',
      details: error.message 
    });
  }
});

app.get('/api/quiz/:roomCode', (req, res) => {
  try {
    const { roomCode } = req.params;

    if (!quizzes[roomCode]) {
      return res.status(404).json({ 
        error: 'Quiz not found',
        details: `No quiz found with room code: ${roomCode}` 
      });
    }

    return res.status(200).json({
      success: true,
      roomCode: roomCode,
      quiz: quizzes[roomCode]
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Error retrieving quiz',
      details: error.message 
    });
  }
});

app.get('/api/quizzes', (req, res) => {
  try {
    const quizList = Object.keys(quizzes).map(roomCode => ({
      roomCode: roomCode,
      totalQuestions: quizzes[roomCode].totalQuestions,
      createdAt: quizzes[roomCode].createdAt
    }));

    return res.status(200).json({
      success: true,
      totalQuizzes: quizList.length,
      quizzes: quizList
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Error retrieving quizzes',
      details: error.message 
    });
  }
});

app.post('/api/groq', async (req, res) => {
  const apiKey = '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';
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GROQ_API_KEY environment variable' });
  }

  try {
    const { model, messages, max_tokens, temperature, stream } = req.body || {};

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages: messages || [
          { role: 'system', content: 'You are a helpful SQL tutor.' },
          { role: 'user', content: 'Help me understand basic SELECT statements.' }
        ],
        max_tokens: typeof max_tokens === 'number' ? max_tokens : 1000,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        stream: !!stream
      })
    });

    if (!groqResponse.ok) {
      const text = await groqResponse.text();
      return res.status(groqResponse.status).json({ error: 'Groq API error', details: text });
    }

    const data = await groqResponse.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err?.message || String(err) });
  }
});

// Export the app
export default app;
