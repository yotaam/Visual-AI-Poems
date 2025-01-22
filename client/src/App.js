import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [userContribution, setUserContribution] = useState('');
  const [poem, setPoem] = useState([]); // array of { stanza, imageUrl }
  const [loadingStanza, setLoadingStanza] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // On initial mount, fetch any existing poem data (in case of refresh)
    fetchPoem();
  }, []);

  const fetchPoem = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/poem');
      setPoem(response.data.poem);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateStanza = async () => {
    if (!userContribution.trim()) return;
    setError('');
    setLoadingStanza(true);
    setLoadingImage(false);

    try {
      // 1) Generate the next stanza from GPT, based on poem so far + user input
      const stanzaRes = await axios.post('http://localhost:4000/api/generate-stanza', {
        userContribution,
      });
      const newStanza = stanzaRes.data.stanza;
      setLoadingStanza(false);

      // 2) Generate an AI illustration for that stanza
      setLoadingImage(true);
      const imageRes = await axios.post('http://localhost:4000/api/generate-image', {
        stanza: newStanza,
      });
      setLoadingImage(false);

      // 3) Update local state with the new stanza + image
      const newPoemEntry = { stanza: newStanza, imageUrl: imageRes.data.imageUrl };
      setPoem((prev) => [...prev, newPoemEntry]);

      // 4) Clear user input
      setUserContribution('');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      setLoadingStanza(false);
      setLoadingImage(false);
    }
  };

  const handleClearPoem = async () => {
    try {
      await axios.delete('http://localhost:4000/api/poem');
      setPoem([]);
      setUserContribution('');
    } catch (err) {
      console.error(err);
      setError('Failed to clear the poem. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Verse &amp; Vision</h1>
      <p style={styles.subtitle}>
        Collaborate with AI to compose a poem line by line, and watch as each stanza is illustrated in real-time.
      </p>

      <div style={styles.inputSection}>
        <textarea
          rows={3}
          placeholder="Type your next poetic line or idea here..."
          value={userContribution}
          onChange={(e) => setUserContribution(e.target.value)}
          style={styles.textArea}
        />
        <div style={styles.buttonsRow}>
          <button
            onClick={handleGenerateStanza}
            disabled={loadingStanza || loadingImage}
            style={styles.button}
          >
            Add Stanza
          </button>
          <button onClick={handleClearPoem} style={{ ...styles.button, marginLeft: '1rem' }}>
            Clear Poem
          </button>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {(loadingStanza || loadingImage) && (
        <p style={styles.loading}>Generating... please wait a moment.</p>
      )}

      <div style={styles.poemContainer}>
        {poem.map((entry, index) => (
          <div key={index} style={styles.poemEntry}>
            <p style={styles.stanzaLabel}>Stanza {index + 1}</p>
            <div style={styles.stanzaText}>{entry.stanza}</div>
            {entry.imageUrl && (
              <div style={styles.imageWrapper}>
                <img
                  src={entry.imageUrl}
                  alt={`Illustration for stanza ${index + 1}`}
                  style={styles.image}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- Inline Styles for Simplicity -----
const styles = {
  container: {
    margin: '2rem auto',
    maxWidth: '800px',
    fontFamily: 'Arial, sans-serif',
    padding: '0 1rem',
  },
  title: {
    textAlign: 'center',
    fontSize: '2rem',
    marginBottom: '0.25rem',
  },
  subtitle: {
    textAlign: 'center',
    color: '#777',
    marginBottom: '2rem',
  },
  inputSection: {
    marginBottom: '1rem',
  },
  textArea: {
    width: '100%',
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '4px',
    marginBottom: '0.5rem',
  },
  buttonsRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  poemContainer: {
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '1rem',
    maxHeight: '600px',
    overflowY: 'auto',
  },
  poemEntry: {
    marginBottom: '2rem',
  },
  stanzaLabel: {
    fontWeight: 'bold',
    marginBottom: '0.25rem',
  },
  stanzaText: {
    marginBottom: '0.5rem',
    lineHeight: '1.5',
  },
  imageWrapper: {
    marginBottom: '1rem',
  },
  image: {
    maxWidth: '100%',
    borderRadius: '4px',
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
  },
  loading: {
    color: '#555',
    marginBottom: '1rem',
  },
};

export default App;
