'use client';
import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const generateImage = async () => {
    if (!prompt) {
      setError('Prompt is empty');
      return;
    }
  
    setError('');
    setImageUrl('');
  
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Response data:', data);
  
      if (data && data.url) {
        setImageUrl(data.url);
      } else {
        setError('Unexpected response structure or missing URL');
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
      setError('Failed to generate image. Please try again.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100">
      <Head>
        <title>Storybook Creator</title>
        <meta name="description" content="Create illustrations for your storybook using AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-500">Storybook Creator</h1>

        <div className="mb-8">
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Enter a prompt for the illustration"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="flex justify-center mb-8">
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={generateImage}
          >
            Generate Illustration
          </button>
        </div>

        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        {imageUrl && (
          <div className="border border-gray-300 rounded-md p-4">
            <img
              src={imageUrl}
              alt="Generated illustration"
              className="w-full h-auto"
              onError={(e) => { 
                e.currentTarget.style.display = 'none'; 
                setError('Failed to load image'); 
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}