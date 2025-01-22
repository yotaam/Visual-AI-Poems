require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY is missing in the .env file.");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for the poem
// Each entry: { stanza: string, imageUrl: string }
let poemData = [];

// ----------------------- ROUTES -----------------------

// GET /api/poem : Retrieve the entire poem
app.get('/api/poem', (req, res) => {
  return res.json({ poem: poemData });
});

// DELETE /api/poem : Clear the poem
app.delete('/api/poem', (req, res) => {
  poemData = [];
  return res.json({ message: 'Poem cleared successfully.' });
});

// POST /api/generate-stanza : Generate a new stanza based on user input + poem so far
app.post('/api/generate-stanza', async (req, res) => {
    try {
      const { userContribution } = req.body;
      if (!userContribution) {
        return res.status(400).json({ error: 'User contribution is required.' });
      }
  
      // Build the poem so far by concatenating existing stanzas
      const poemSoFar = poemData.map(({ stanza }) => stanza).join('\n');
  
      // We'll create a short "system" message for context and a "user" message with the actual request.
      const messages = [
        {
          role: 'system',
          content: `You are a helpful, creative poet who extends poems 
  in a consistent style and tone. Write exactly one short stanza (1-3 lines).`,
        },
        {
          role: 'user',
          content: `So far, the poem is:\n"${poemSoFar}"\n\nThe user added: "${userContribution}"
  Please continue the poem with one additional stanza in a similar style.`,
        },
      ];
  
      // Call the Chat Completions endpoint
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 100,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );
  
      // Extract the generated stanza from the assistant's reply
      const gptOutput = response.data.choices[0].message.content.trim();
  
      return res.json({ stanza: gptOutput });
    } catch (error) {
      console.error('Error generating stanza:', error.response?.data || error.message);
      return res.status(500).json({ error: 'Failed to generate stanza.' });
    }
  });

// POST /api/generate-image : Generate an AI illustration for the provided stanza
app.post('/api/generate-image', async (req, res) => {
  try {
    const { stanza } = req.body;
    if (!stanza) {
      return res.status(400).json({ error: "Stanza text is required." });
    }

    // Craft a prompt for DALL·E (or another image model)
    // Add a style to guide the artistic output
    const imagePrompt = `
Create a single illustration in a watercolor style inspired by this poetic stanza:
"${stanza}"
    `;

    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt: imagePrompt,
        n: 1,
        size: '512x512',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const imageUrl = response.data.data[0].url;
    // Store the stanza + image URL in poemData
    poemData.push({ stanza, imageUrl });

    return res.json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to generate image.' });
  }
});

// ----------------------- START SERVER -----------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
