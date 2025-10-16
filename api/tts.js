// File: /api/tts.js

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    const { textToSpeak } = request.body;
    if (!textToSpeak) {
      return response.status(400).json({ message: 'textToSpeak is required.' });
    }

    // Securely get the API key
    const apiKey = process.env.GEMINI_API_KEY;
    const ttsModelUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

    const payload = {
      input: { text: textToSpeak },
      voice: { languageCode: 'en-US', name: 'en-US-Studio-O' }, // High quality voice
      audioConfig: { audioEncoding: 'LINEAR16', sampleRateHertz: 24000 }
    };
    
    // Note: We use a different Google Cloud endpoint for high-quality TTS.
    // The Gemini TTS is still in preview and might have limitations. This is more robust.
    const googleResponse = await fetch(ttsModelUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!googleResponse.ok) {
      const errorBody = await googleResponse.text();
      throw new Error(`Google TTS API failed: ${googleResponse.status} ${errorBody}`);
    }

    const result = await googleResponse.json();
    const audioData = result.audioContent; // The response gives us base64 audio directly

    if (!audioData) {
      throw new Error("No audio data received from Google TTS API.");
    }

    // Send the audio data back to the frontend
    response.status(200).json({ audioData: audioData });

  } catch (error) {
    console.error("Error in /api/tts:", error);
    response.status(500).json({ message: 'Error generating audio.' });
  }
}