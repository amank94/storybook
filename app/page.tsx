'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [themes, setThemes] = useState('');
  const [story, setStory] = useState('');  // New state to hold the overall story prompt
  const [images, setImages] = useState<{ url: string; prompt: string }[]>([]); // Update to store prompt along with the URL
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generateStoryFrames = async () => {
    if (!name || !description || !themes) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setImages([]);
    setStory('');  // Reset story
    setLoading(true);

    try {
      const response = await fetch('/api/generate-frames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, themes }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStory(data.story);  // Set the overall story
      setImages(data.images);  // Set the images with prompts

    } catch (error) {
      console.error('Failed to generate story frames:', error);
      setError('Failed to generate story frames. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-blue-100 to-purple-100 p-8">
      <motion.h1 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-bold mb-8 text-center text-blue-600"
      >
        Storybook Creator
      </motion.h1>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-6 mb-8 w-full max-w-2xl"
      >
        <input
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          placeholder="Character Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          placeholder="Character Description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          placeholder="Themes (comma-separated)"
          value={themes}
          onChange={(e) => setThemes(e.target.value)}
        />
        <button
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
          onClick={generateStoryFrames}
          disabled={loading}
        >
          {loading ? 'Generating Frames...' : 'Generate Story Frames'}
        </button>
      </motion.div>

      {error && (
        <div className="text-red-500 mb-4 text-center">{error}</div>
      )}

      {story && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8 w-full max-w-2xl"
        >
          <h2 className="text-2xl font-bold mb-4">Generated Story:</h2>
          <p className="text-black whitespace-pre-line">{story}</p>
        </motion.div>
      )}

      {images.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {images.map((image, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className="relative border border-gray-300 rounded-md overflow-hidden shadow-lg bg-white"
            >
              <img
                src={image.url}
                alt={`Story frame ${index + 1}`}
                className="w-full h-64 object-cover"
                onError={(e) => { 
                  e.currentTarget.src = '/placeholder-image.jpg'; 
                  console.log(`Failed to load image ${index + 1}`); 
                }}
              />
              <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-2 text-sm">
                {image.prompt}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
