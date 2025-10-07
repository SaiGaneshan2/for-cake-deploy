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
const PORT = 3001;

// ============================================
// IN-MEMORY DATABASE
// ============================================
const quizzes = {};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
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

// ============================================
// HELPER FUNCTION: Split text into chunks
// ============================================
function splitTextIntoChunks(text, chunkSize = 30000) {
  const chunks = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;

    // If we're not at the end of the text, try to find a good breaking point
    if (endIndex < text.length) {
      // Look for the last sentence ending (. ! ?) within the chunk
      const remainingText = text.substring(startIndex, endIndex);
      const lastPeriod = remainingText.lastIndexOf('. ');
      const lastExclamation = remainingText.lastIndexOf('! ');
      const lastQuestion = remainingText.lastIndexOf('? ');
      
      const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
      
      if (lastSentenceEnd > chunkSize * 0.7) {
        // If we found a sentence ending in the last 30% of the chunk, use it
        endIndex = startIndex + lastSentenceEnd + 2; // +2 to include the punctuation and space
      } else {
        // Otherwise, try to break at a paragraph
        const lastNewline = remainingText.lastIndexOf('\n\n');
        if (lastNewline > chunkSize * 0.5) {
          endIndex = startIndex + lastNewline + 2;
        } else {
          // Last resort: break at the last space to avoid splitting words
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

// ============================================
// HELPER FUNCTION: Generate Unique Room Code
// ============================================
function generateRoomCode() {
  // Generate a 6-digit room code
  let roomCode;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    // Generate a random 6-digit number (100000 to 999999)
    roomCode = Math.floor(100000 + Math.random() * 900000).toString();
    attempts++;

    // Safety check to prevent infinite loop
    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique room code after maximum attempts');
    }
  } while (quizzes[roomCode]); // Keep generating until we find an unused code

  return roomCode;
}

// ============================================
// CORE AI FUNCTION: Generate MCQs from Text
// ============================================
async function generateMCQs(documentText, questionsToGenerate = 3) {
  const apiKey = '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';
  
  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY');
  }

  try {
    console.log('Generating MCQs from document text...');
    console.log('Document length:', documentText.length, 'characters');
    console.log('Target questions to generate:', questionsToGenerate);

    // Construct the optimal prompts for MCQ generation
    const systemPrompt = `You are an expert educational content creator specializing in generating high-quality Multiple Choice Questions (MCQs). Your task is to analyze the provided text and create relevant, challenging, and educational quiz questions.

CRITICAL INSTRUCTIONS:
1. Generate EXACTLY ${questionsToGenerate} multiple choice questions based on the provided document text chunk
2. Each question should test understanding of key concepts from the text
3. Provide exactly 4 options for each question (labeled as simple strings, not A/B/C/D)
4. Ensure one option is clearly correct and the others are plausible but incorrect
5. Make questions clear, unambiguous, and educational
6. **CRITICAL: Each answer option MUST be 3 words or fewer** - This is for a game where answers appear as floating collectibles. Use single words, short phrases, or abbreviations (e.g., "CNN", "Neural Network", "Feature Extraction", "SVM", "Classification")
7. IMPORTANT: You must generate exactly ${questionsToGenerate} questions, no more, no less

OUTPUT FORMAT (MANDATORY):
You MUST respond with ONLY a valid JSON array. Do not include any explanatory text, markdown formatting, or code blocks. The response must be parseable JSON.

Each question object must have exactly these three keys:
- "question": (string) The question text
- "options": (array of 4 strings) The answer choices - EACH MUST BE 3 WORDS OR FEWER
- "correctAnswer": (string) The correct answer that EXACTLY matches one of the options

Example format:
[
  {
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctAnswer": "Paris"
  }
]`;

    const userPrompt = `Please analyze the following document text and generate EXACTLY ${questionsToGenerate} high-quality multiple choice questions based on its content. Remember to respond with ONLY the JSON array containing exactly ${questionsToGenerate} questions, no additional text.

DOCUMENT TEXT:
${documentText}

Generate exactly ${questionsToGenerate} MCQs now in the specified JSON format.`;

    // Make API call to Groq
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

    console.log('Raw AI Response:', aiResponse.substring(0, 200) + '...');

    // Parse the JSON response
    let mcqs;
    try {
      // Try to parse directly
      mcqs = JSON.parse(aiResponse);
    } catch (parseError) {
      // If direct parse fails, try to extract JSON from markdown code blocks
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        mcqs = JSON.parse(jsonMatch[1]);
      } else {
        // Try to find JSON array in the response
        const arrayMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          mcqs = JSON.parse(arrayMatch[0]);
        } else {
          throw new Error('Could not extract valid JSON from AI response');
        }
      }
    }

    // Validate the structure
    if (!Array.isArray(mcqs)) {
      throw new Error('Response is not an array');
    }

    // Validate each question object
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

    console.log(`Successfully generated ${mcqs.length} MCQs`);
    return mcqs;

  } catch (error) {
    console.error('Error in generateMCQs:', error);
    throw error;
  }
}

// File upload endpoint
app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse quiz configuration from request body
    const numLevels = parseInt(req.body.numLevels) || 5;
    const questionsPerLevel = parseInt(req.body.questionsPerLevel) || 3;
    const totalQuestionsNeeded = numLevels * questionsPerLevel;

    // Log the received file information
    console.log('\n========================================');
    console.log('FILE UPLOAD STARTED');
    console.log('========================================');
    console.log('Original name:', req.file.originalname);
    console.log('Saved as:', req.file.filename);
    console.log('Size:', req.file.size, 'bytes');
    console.log('Path:', req.file.path);
    console.log('Mimetype:', req.file.mimetype);
    console.log('\n--- QUIZ CONFIGURATION ---');
    console.log('Number of Levels:', numLevels);
    console.log('Questions per Level:', questionsPerLevel);
    console.log('Total Questions Needed:', totalQuestionsNeeded);

    let extractedText = '';

    // STEP 1: Extract text based on file type
    console.log('\n--- STEP 1: TEXT EXTRACTION ---');
    if (req.file.mimetype === 'application/pdf') {
      // Handle PDF files
      console.log('Processing PDF file...');
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
      console.log('✓ PDF text extracted successfully');
    } else if (req.file.mimetype === 'text/plain') {
      // Handle TXT files
      console.log('Processing TXT file...');
      extractedText = fs.readFileSync(req.file.path, 'utf8');
      console.log('✓ TXT text extracted successfully');
    } else {
      // Fallback for other file types
      console.log('Unknown file type, attempting to read as text...');
      extractedText = fs.readFileSync(req.file.path, 'utf8');
    }

    console.log('Extracted text length:', extractedText.length, 'characters');
    console.log('Text preview:', extractedText.substring(0, 200) + '...');

    // Validate extracted text
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ 
        error: 'No text could be extracted from the file',
        details: 'The file appears to be empty or contains no readable text'
      });
    }

    // STEP 2: Split text into chunks
    console.log('\n--- STEP 2: TEXT CHUNKING ---');
    const chunks = splitTextIntoChunks(extractedText, 30000);
    console.log(`Split text into ${chunks.length} chunk(s)`);
    chunks.forEach((chunk, index) => {
      console.log(`  Chunk ${index + 1}: ${chunk.length} characters`);
    });

    // STEP 3: Generate MCQs using AI for each chunk (SEQUENTIAL PROCESSING)
    console.log('\n--- STEP 3: AI QUESTION GENERATION (SEQUENTIAL) ---');
    console.log(`Processing ${chunks.length} chunk(s) one at a time to manage API rate limits...`);
    console.log(`Target: ${totalQuestionsNeeded} questions`);
    
    // Process chunks sequentially using for...of loop
    const allQuestions = [];
    
    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index];
      
      // Check if we already have enough questions
      if (allQuestions.length >= totalQuestionsNeeded) {
        console.log(`\n✓ Target reached! Have ${allQuestions.length} questions, need ${totalQuestionsNeeded}`);
        console.log(`Skipping remaining ${chunks.length - index} chunk(s) to save API calls`);
        break;
      }
      
      console.log(`\nProcessing chunk ${index + 1} of ${chunks.length}...`);
      console.log(`Current question count: ${allQuestions.length}/${totalQuestionsNeeded}`);
      
      // Calculate how many questions we still need
      const questionsStillNeeded = totalQuestionsNeeded - allQuestions.length;
      console.log(`Questions still needed: ${questionsStillNeeded}`);
      
      try {
        // Pass the exact number of questions needed to generateMCQs
        const questions = await generateMCQs(chunk, questionsStillNeeded);
        console.log(`✓ Chunk ${index + 1} completed: ${questions.length} questions generated`);
        
        // Add questions to the final array
        allQuestions.push(...questions);
        
        console.log(`Total questions collected so far: ${allQuestions.length}/${totalQuestionsNeeded}`);
        
        // Check if we have enough questions after adding
        if (allQuestions.length >= totalQuestionsNeeded) {
          console.log(`✓ Reached target! Stopping generation.`);
          break;
        }
        
        // Optional: Add a small delay between requests to further reduce rate limit issues
        if (index < chunks.length - 1) {
          console.log('Waiting 1 second before next chunk...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`✗ Chunk ${index + 1} failed:`, error.message);
        // Continue processing remaining chunks even if one fails
      }
    }
    
    // Trim the questions array to exactly the number needed
    const finalQuestions = allQuestions.slice(0, totalQuestionsNeeded);

    console.log('\n========================================');
    console.log('SUCCESS: Generated', allQuestions.length, 'total questions');
    console.log('Returning exactly', finalQuestions.length, 'questions as requested');
    console.log(`From ${chunks.length} chunk(s) processed`);
    console.log('========================================\n');

    // Return the generated questions to the client
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
    console.error('\n========================================');
    console.error('ERROR in /api/upload:', error);
    console.error('========================================\n');
    return res.status(500).json({ 
      error: 'Error processing file and generating questions', 
      details: error.message 
    });
  }
});

// ============================================
// SAVE QUIZ ENDPOINT
// ============================================
app.post('/api/quiz', (req, res) => {
  try {
    const { questions, numLevels, questionsPerLevel } = req.body;

    // Validate the request body
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

    // Validate each question has the required structure
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
        return res.status(400).json({ 
          error: 'Invalid question format',
          details: `Question ${i + 1} is missing required fields or has invalid structure` 
        });
      }
    }

    // Generate a unique room code
    const roomCode = generateRoomCode();

    // Save the quiz to the in-memory database
    quizzes[roomCode] = {
      questions: questions,
      numLevels: numLevels || Math.ceil(questions.length / 3),
      questionsPerLevel: questionsPerLevel || 3,
      createdAt: new Date().toISOString(),
      totalQuestions: questions.length
    };

    console.log('\n========================================');
    console.log('QUIZ SAVED SUCCESSFULLY');
    console.log('========================================');
    console.log('Room Code:', roomCode);
    console.log('Total Questions:', questions.length);
    console.log('Number of Levels:', quizzes[roomCode].numLevels);
    console.log('Questions per Level:', quizzes[roomCode].questionsPerLevel);
    console.log('Created At:', quizzes[roomCode].createdAt);
    console.log('Total Quizzes in Database:', Object.keys(quizzes).length);
    console.log('========================================\n');

    // Return success response with room code
    return res.status(200).json({
      success: true,
      roomCode: roomCode,
      message: `Quiz saved successfully with ${questions.length} questions`,
      totalQuestions: questions.length
    });

  } catch (error) {
    console.error('Error saving quiz:', error);
    return res.status(500).json({ 
      error: 'Error saving quiz',
      details: error.message 
    });
  }
});

// ============================================
// GET QUIZ BY ROOM CODE
// ============================================
app.get('/api/quiz/:roomCode', (req, res) => {
  try {
    const { roomCode } = req.params;

    // Check if quiz exists
    if (!quizzes[roomCode]) {
      return res.status(404).json({ 
        error: 'Quiz not found',
        details: `No quiz found with room code: ${roomCode}` 
      });
    }

    // Return the quiz data
    return res.status(200).json({
      success: true,
      roomCode: roomCode,
      quiz: quizzes[roomCode]
    });

  } catch (error) {
    console.error('Error retrieving quiz:', error);
    return res.status(500).json({ 
      error: 'Error retrieving quiz',
      details: error.message 
    });
  }
});

// ============================================
// GET ALL QUIZZES (for debugging/admin)
// ============================================
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
    console.error('Error retrieving quizzes:', error);
    return res.status(500).json({ 
      error: 'Error retrieving quizzes',
      details: error.message 
    });
  }
});

// Groq API endpoint
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
