// File: /api/chat.js

import fs from 'fs';
import path from 'path';
const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    const { prompt } = request.body;
    if (!prompt) {
      return response.status(400).json({ message: 'Prompt is required.' });
    }

    // Securely access the API key from Vercel's environment variables
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Read the config file from the server's file system (NOT the browser)
    // Note: We adjust the path because on Vercel, the file will be at the root.
    const configPath = path.join(process.cwd(), 'clara-config.json');
    const configFile = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configFile);

    // Build the system instruction from the template
    const systemInstruction = config.systemInstructionTemplate
        .replace('{aiName}', config.aiName)
        .replace('{aiFullName}', config.aiFullName);

    const fullPrompt = `${systemInstruction}\n\nUser: ${prompt}\nAI:`;

    const result = await model.generateContent(fullPrompt);
    const aiResponse = await result.response;
    const text = aiResponse.text();

    // Send only the final text message back to the frontend
    response.status(200).json({ message: text });

  } catch (error) {
    console.error("Error in /api/chat:", error);
    response.status(500).json({ message: 'Error generating text response.' });
  }
}