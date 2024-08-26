import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('Handler function called');

  try {
    const { prompt } = req.body;
    console.log('Server received prompt:', prompt);

    if (!prompt) {
      return res.status(400).json({ message: 'No prompt provided' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('API key is not set in environment variables');
      return res.status(500).json({ message: 'API key not found' });
    }

    const openai = new OpenAI({ apiKey });
    console.log('OpenAI client initialized successfully');

    console.log('Sending request to OpenAI');
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    console.log('Full OpenAI response:', JSON.stringify(response, null, 2));

    if (!response.data || response.data.length === 0 || !response.data[0].url) {
      console.error('Unexpected response structure or missing URL:', response);
      return res.status(500).json({ message: 'Failed to retrieve image URL from OpenAI response' });
    }

    const imageUrl = response.data[0].url;
    console.log('Image URL retrieved:', imageUrl);
    return res.status(200).json({ url: imageUrl });

  } catch (error) {
    console.error('Error in /api/generate-image:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
