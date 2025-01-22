import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [userContribution, setUserContribution] = useState('');
  const [poem, setPoem] = useState([]); // array of { stanza, imageUrl }
  const [loadingStanza, setLoadingStanza] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState(''); // Step-by-step generation messages

  useEffect(() => {
    // On initial mount, fetch any existing poem data (in case of refresh)
    fetchPoem();
  }, []);

  // -----------------------------
  //       SERVER INTERACTIONS
  // -----------------------------
  const fetchPoem = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/poem');
      setPoem(response.data.poem);
    } catch (err) {
      console.error(err);
    }
  };

  // Main handler: user stanza => user stanza image => AI stanza => AI stanza image
  const handleAddStanza = async () => {
    if (!userContribution.trim()) return;
    setError('');

    // Disable inputs
    setLoadingStanza(true);
    setLoadingImage(true);
    setLoadingMessage("Generating User's Line Image...");

    try {
      // 1) Generate IMAGE for the USER stanza
      const userImageRes = await axios.post('http://localhost:4000/api/generate-image', {
        stanza: userContribution,
      });

      // 2) Add user's stanza + image to poem
      const userPoemEntry = {
        stanza: userContribution,
        imageUrl: userImageRes.data.imageUrl,
      };
      setPoem((prev) => [...prev, userPoemEntry]);
      setUserContribution(''); // clear the text area

      // 3) Generate AI stanza
      setLoadingMessage('Generating AI Response...');
      const aiStanzaRes = await axios.post('http://localhost:4000/api/generate-stanza', {
        userContribution,
      });
      const aiStanza = aiStanzaRes.data.stanza;

      // 4) Generate IMAGE for AI stanza
      setLoadingMessage("Generating AI's Line Image...");
      const aiImageRes = await axios.post('http://localhost:4000/api/generate-image', {
        stanza: aiStanza,
      });

      // 5) Add AI stanza + image
      const aiPoemEntry = { stanza: aiStanza, imageUrl: aiImageRes.data.imageUrl };
      setPoem((prev) => [...prev, aiPoemEntry]);

      // Done
      setLoadingMessage('');
      setLoadingStanza(false);
      setLoadingImage(false);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      setLoadingStanza(false);
      setLoadingImage(false);
      setLoadingMessage('');
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

  // -----------------------------
  //              UI
  // -----------------------------
  return (
    <div style={styles.pageWrapper}>
      {/* Optional Fancy Background Decoration */}
      <div style={styles.gradientOverlay}></div>

      <div style={styles.container}>
        <h1 style={styles.title}>Verse &amp; Vision</h1>
        <p style={styles.subtitle}>
          Co-create poetry with AI: your line, then the AI’s line—each stanza illustrated in real time.
        </p>

        <div style={styles.inputSection}>
          <textarea
            rows={3}
            placeholder="Type your next poetic line or idea here..."
            value={userContribution}
            onChange={(e) => setUserContribution(e.target.value)}
            style={styles.textArea}
            disabled={loadingStanza || loadingImage}
          />

          <div style={styles.buttonsRow}>
            <button
              onClick={handleAddStanza}
              disabled={loadingStanza || loadingImage}
              style={{
                ...styles.button,
                opacity: loadingStanza || loadingImage ? 0.7 : 1,
                cursor: loadingStanza || loadingImage ? 'not-allowed' : 'pointer',
              }}
            >
              Add Stanza
            </button>

            <button
              onClick={handleClearPoem}
              style={{
                ...styles.button,
                marginLeft: '1rem',
                backgroundColor: '#FF5252',
                opacity: loadingStanza || loadingImage ? 0.7 : 1,
                cursor: loadingStanza || loadingImage ? 'not-allowed' : 'pointer',
              }}
              disabled={loadingStanza || loadingImage}
            >
              Clear Poem
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && <p style={styles.error}>{error}</p>}

        {/* Loading Indicator */}
        {loadingMessage && (
          <div style={styles.loadingContainer}>
            <p style={styles.loadingText}>{loadingMessage}</p>
            <div style={styles.spinner}></div>
          </div>
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
    </div>
  );
}

// -----------------------------
//        STYLES
// -----------------------------
const styles = {
  // Full-page wrapper to hold background and center content
  pageWrapper: {
    minHeight: '100vh',
    fontFamily: "'Poppins', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },

  // Soft gradient overlay behind the container
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)',
    zIndex: -1,
  },

  container: {
    margin: '0 auto',
    maxWidth: '800px',
    padding: '2rem 1rem',
    // A subtle box shadow around the main content
    backgroundColor: '#ffffffcc',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  },

  title: {
    textAlign: 'center',
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: '#333',
  },

  subtitle: {
    textAlign: 'center',
    color: '#666',
    fontSize: '1.1rem',
    marginBottom: '2rem',
    lineHeight: '1.4',
  },

  inputSection: {
    marginBottom: '1.5rem',
  },

  textArea: {
    width: '95%',
    padding: '.5rem',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontFamily: "'Poppins', sans-serif",
    resize: 'vertical',
    outline: 'none',
    transition: 'box-shadow 0.2s ease',
  },

  buttonsRow: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '0.5rem',
  },

  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '0.75rem 1.25rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 500,
    fontFamily: "'Poppins', sans-serif",
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s, transform 0.3s',
  },

  // Poem display area
  poemContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem', // Space between stanzas
    padding: '1rem',
    backgroundColor: '#fafafa',
    border: '1px solid #ccc',
    borderRadius: '6px',
    maxHeight: '300px',
    overflowY: 'auto',
  },

  poemEntry: {
    display: 'flex', // Flexbox for side-by-side layout
    justifyContent: 'space-between', // Separate text and image
    alignItems: 'center', // Align items vertically
    padding: '1rem',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    gap: '1rem', // Space between text and image
  },

  stanzaLabel: {
    fontWeight: 600,
    marginBottom: '0.5rem',
    fontSize: '1.1rem',
    color: '#444',
  },

  stanzaText: {
    flex: 2, // Text takes up more space
    fontSize: '1rem',
    color: '#444',
    lineHeight: '1.5',
    margin: 0,
  },

  imageWrapper: {
    flex: 1, // Image takes less space
    maxWidth: '150px', // Limit image size
    textAlign: 'center',
  },

  image: {
    width: '100%', // Ensure the image scales to fit the wrapper
    maxHeight: '120px', // Optional: Limit image height
    objectFit: 'cover', // Maintain aspect ratio
    borderRadius: '4px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  },

  // Error text
  error: {
    color: '#ff4d4d',
    textAlign: 'center',
    marginBottom: '1rem',
    fontWeight: 500,
  },

  // Loading area
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
    gap: '1rem',
  },

  loadingText: {
    fontSize: '1rem',
    color: '#666',
    fontWeight: 500,
  },

  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid #ccc',
    borderTop: '3px solid #4CAF50',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  // For any custom keyframes, inline approach:
  '@keyframes spin': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
};



export default App;
