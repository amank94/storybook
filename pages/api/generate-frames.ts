import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, description, themes } = req.body;

    if (!name || !description || !themes) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'API key not found' });
    }

    const openai = new OpenAI({ apiKey });

    // Step 1: Generate the overall story prompt
    const storyPrompt = `Create a linear fantasy cartoon-style story about ${name}, a young girl with dirty blonde hair that dances like golden wheat in the wind. ${description} The story should incorporate the following themes: ${themes}. Ensure the character appearance remains consistent across all images, with a focus on a fantasy, cartoon style. The story should be suitable for generating 5 subsequent images, each representing a key scene or moment in the story.`;

    const storyResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: storyPrompt }],
      max_tokens: 1000,
    });

    const overallStory = storyResponse.choices[0].message.content.trim();
    console.log('Generated Story Prompt:', overallStory);

    // Step 2: Generate image prompts for each scene
    const imagePrompts = overallStory.split('\n').filter(prompt => prompt.trim() !== '');

    const images = [];
    for (let i = 0; i < imagePrompts.length && i < 5; i++) {
      const prompt = `Fantasy cartoon style illustration: ${imagePrompts[i]} Ensure the character, ${name}, looks the same across all images with dirty blonde hair and a consistent outfit.`;
      console.log(`Generating image ${i + 1} for prompt:`, prompt);

      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
      });

      const imageUrl = imageResponse.data?.[0]?.url;
      if (!imageUrl) {
        return res.status(500).json({ message: `Failed to retrieve image URL for prompt: ${prompt}` });
      }

      images.push({ prompt, url: imageUrl });
    }

    return res.status(200).json({ story: overallStory, images });

  } catch (error) {
    console.error('Error in /api/generate-frames:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
