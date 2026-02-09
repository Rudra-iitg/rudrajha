require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Firebase Initialization ---
let db;
try {
    // Check if the service account file exists or env vars are set
    // For local dev, placing 'firebase-service-account.json' in root is easiest
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
    
    // Only initialize if the file exists or logic allows
    // In a real app, you'd crash if this fails, but for your portfolio template we'll wrap it
    // to prevent server crash if you haven't added the key yet.
    if (require('fs').existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        console.log("🔥 Firebase Admin Initialized Successfully");
    } else {
        console.warn("⚠️ Firebase Warning: 'firebase-service-account.json' not found. Contact form will only log to console.");
    }
} catch (error) {
    console.error("Firebase Init Error:", error.message);
}

// Middleware
app.use(cors());
app.use(express.json());

// Explicitly serve index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve other static files
app.use(express.static(__dirname)); 

// --- AI Chat Endpoint ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'API_KEY_MISSING');

app.post('/api/chat', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');

        const { message } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-pro"});
        const prompt = `Role: Rudra's Portfolio AI. Style: Cyberpunk/Neo-Brutalist. User: ${message}. Keep it short.`;
        
        const result = await model.generateContent(prompt);
        res.json({ response: (await result.response).text() });
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ response: "⚠️ NEURAL LINK FAILED" });
    }
});

// --- Contact Form Endpoint (Firebase) ---
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    const timestamp = new Date().toISOString();

    console.log(`\n📨 NEW MESSAGE: ${name} (${email}): ${message}`);

    if (!db) {
        return res.json({ 
            success: true, 
            message: "Message received (Firebase not configured, check console logs)" 
        });
    }

    try {
        await db.collection('messages').add({
            name,
            email,
            message,
            timestamp,
            read: false
        });
        res.json({ success: true, message: "Securely stored in Firebase" });
    } catch (error) {
        console.error('Firebase Write Error:', error);
        res.status(500).json({ success: false, message: "Database Write Failed" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n🚀 SYSTEM ONLINE`);
    console.log(`> Server: http://localhost:${PORT}`);
    console.log(`> Network: http://192.168.1.3:${PORT}`); 
});