const express = require('express');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

dotenv.config();

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const upload = multer({ dest: 'uploads/' });

function fileToGenerativePart(filePath, mimeType) {
    const fileData = fs.readFileSync(filePath);
    const base64EncodedData = fileData.toString('base64');
    return {
        inlineData: {
            data: base64EncodedData,
            mimeType
        },
    };
}

app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required for text generation.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent(prompt);
        const response = await result.response;

        res.json({ output: response.text() });
    } catch (error) {
        console.error('Error generating text:', error);
        res.status(500).json({ error: error.message || 'An error occurred during text generation.' });
    }
});

app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    const { prompt } = req.body;
    const imageFile = req.file;

    if (!prompt || !imageFile) {
        if (imageFile) {
            fs.unlink(imageFile.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        return res.status(400).json({ error: 'Both prompt and an image file are required.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const imagePart = fileToGenerativePart(imageFile.path, imageFile.mimetype);
        const requestParts = [{ text: prompt }, imagePart];

        const result = await model.generateContent(requestParts);
        const response = await result.response;

        res.json({ output: response.text() });
    } catch (error) {
        console.error('Error generating content from image:', error);
        res.status(500).json({ error: error.message || 'An error occurred during image-based content generation.' });
    } finally {
        if (imageFile) {
            fs.unlink(imageFile.path, (err) => {
                if (err) console.error('Error deleting uploaded file:', err);
            });
        }
    }
});

app.post('/generate-from-document', upload.single('document'), async (req, res) => {
    const { prompt } = req.body;
    const documentFile = req.file;

    if (!prompt || !documentFile) {
        if (documentFile) {
            fs.unlink(documentFile.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        return res.status(400).json({ error: 'Both prompt and a document file are required.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const documentPart = fileToGenerativePart(documentFile.path, documentFile.mimetype);
        const requestParts = [{ text: prompt }, documentPart];

        const result = await model.generateContent(requestParts);
        const response = await result.response;

        res.json({ output: response.text() });
    } catch (error) {
        console.error('Error generating content from document:', error);
        res.status(500).json({ error: error.message || 'An error occurred during document-based content generation.' });
    } finally {
        if (documentFile) {
            fs.unlink(documentFile.path, (err) => {
                if (err) console.error('Error deleting uploaded document file:', err);
            });
        }
    }
});

app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
    const { prompt } = req.body;
    const audioFile = req.file;

    if (!prompt || !audioFile) {
        if (audioFile) {
            fs.unlink(audioFile.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        return res.status(400).json({ error: 'Both prompt and an audio file are required.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const audioPart = fileToGenerativePart(audioFile.path, audioFile.mimetype);
        const requestParts = [{ text: prompt }, audioPart];

        const result = await model.generateContent(requestParts);
        const response = await result.response;

        res.json({ output: response.text() });
    } catch (error) {
        console.error('Error generating content from audio:', error);
        res.status(500).json({ error: error.message || 'An error occurred during audio-based content generation.' });
    } finally {
        if (audioFile) {
            fs.unlink(audioFile.path, (err) => {
                if (err) console.error('Error deleting uploaded audio file:', err);
            });
        }
    }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Gemini API server is running at http://localhost:${PORT}`);
    console.log(`Ensure your .env file has GEMINI_API_KEY set.`);
    console.log(`Text generation endpoint: POST /generate-text with { "prompt": "Your text here" }`);
    console.log(`Image generation endpoint: POST /generate-from-image with form-data (prompt, image)`);
    console.log(`Document generation endpoint: POST /generate-from-document with form-data (prompt, document)`);
    console.log(`Audio generation endpoint: POST /generate-from-audio with form-data (prompt, audio)`);
});