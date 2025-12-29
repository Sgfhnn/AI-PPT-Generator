require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    console.log(`Using API Key: ${key ? key.substring(0, 8) + '...' : 'MISSING'}`);

    const genAI = new GoogleGenerativeAI(key);

    // Try the most standard model first
    const models = ['gemini-1.5-flash', 'gemini-pro'];

    for (const modelName of models) {
        console.log(`\nTesting ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        try {
            await model.generateContent('Hello');
            console.log(`✅ ${modelName} works!`);
        } catch (e) {
            console.log(`❌ ${modelName} failed: ${e.message}`);
        }
    }
}

listModels();
