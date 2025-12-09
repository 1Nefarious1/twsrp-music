import { useState, useEffect } from 'react';

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [message, setMessage] = useState('');

  // Load songs from GitHub
  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await fetch('/api/songs');
      const data = await response.json();
      setSongs(data);
    } catch (error) {
      console.log('Loading songs...');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!songTitle) {
      setMessage('Please enter a song title');
      return;
    }

    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files[0]) {
      setMessage('Please select an MP3 file');
      return;
    }

    const file = fileInput.files[0];
    if (!file.name.endsWith('.mp3')) {
      setMessage('Only MP3 files allowed');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('title', songTitle);
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage(`✅ Uploaded! URL: ${result.url}`);
        setSongTitle('');
        fileInput.value = '';
        fetchSongs();
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🎵 TWSRP MUSIC STREAM</h1>
        <p style={styles.subtitle}>Upload MP3s • Generate Links • Stream In-Game</p>
      </header>

      <main style={styles.main}>
        {/* Upload Section */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>UPLOAD NEW SONG</h2>
          <form onSubmit={handleUpload} style={styles.form}>
            <input
              type="text"
              placeholder="Song Title"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              style={styles.input}
              required
            />
            <input
              id="fileInput"
              type="file"
              accept=".mp3"
              style={styles.fileInput}
              required
            />
            <button
              type="submit"
              disabled={uploading}
              style={uploading ? styles.buttonDisabled : styles.button}
            >
              {uploading ? '📤 UPLOADING...' : '⬆️ UPLOAD MP3'}
            </button>
          </form>
          {message && <div style={styles.message}>{message}</div>}
          <p style={styles.note}>Max file size: 25MB • MP3 only • Free forever storage</p>
        </div>

        {/* Search */}
        <div style={styles.card}>
          <input
            type="text"
            placeholder="🔍 Search songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <p style={styles.count}>{filteredSongs.length} songs</p>
        </div>

        {/* Songs List */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>ALL SONGS</h2>
          {filteredSongs.length === 0 ? (
            <p style={styles.empty}>No songs found. Upload one above!</p>
          ) : (
            <div style={styles.songsList}>
              {filteredSongs.map((song, index) => (
                <div key={index} style={styles.songItem}>
                  <div style={styles.songInfo}>
                    <h3 style={styles.songTitle}>{song.title}</h3>
                    <audio controls style={styles.audioPlayer}>
                      <source src={song.url} type="audio/mpeg" />
                    </audio>
                    <div style={styles.urlContainer}>
                      <input
                        type="text"
                        value={song.url}
                        readOnly
                        style={styles.urlInput}
                      />
                      <button
                        onClick={() => copyToClipboard(song.url)}
                        style={styles.copyButton}
                      >
                        📋 Copy
                      </button>
                    </div>
                    <p style={styles.usage}>In-game: <code>/streammusic {song.url}</code></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer style={styles.footer}>
        <p>Created by Nefar • In collaboration with Binosko</p>
        <p>Storage: GitHub (Free Forever) • Unlimited songs</p>
      </footer>
    </div>
  );
}

// Styles
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#000', color: '#fff', fontFamily: 'Arial' },
  header: { padding: '20px', textAlign: 'center', borderBottom: '1px solid #333' },
  title: { margin: 0, fontSize: '2rem' },
  subtitle: { margin: '5px 0 0 0', color: '#aaa' },
  main: { maxWidth: '800px', margin: '0 auto', padding: '20px' },
  card: { backgroundColor: '#111', padding: '20px', borderRadius: '10px', marginBottom: '20px' },
  cardTitle: { marginTop: 0, color: '#fff' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '10px', backgroundColor: '#222', color: '#fff', border: '1px solid #333', borderRadius: '5px' },
  fileInput: { padding: '10px', backgroundColor: '#222', color: '#fff', border: '1px solid #333', borderRadius: '5px' },
  button: { padding: '10px', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  buttonDisabled: { padding: '10px', backgroundColor: '#666', color: '#999', border: 'none', borderRadius: '5px', cursor: 'not-allowed' },
  message: { marginTop: '10px', padding: '10px', backgroundColor: '#1a1a1a', borderRadius: '5px' },
  note: { marginTop: '10px', color: '#888', fontSize: '14px' },
  searchInput: { width: '100%', padding: '10px', backgroundColor: '#222', color: '#fff', border: '1px solid #333', borderRadius: '5px' },
  count: { textAlign: 'right', color: '#888', marginTop: '5px' },
  empty: { textAlign: 'center', color: '#666' },
  songsList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  songItem: { backgroundColor: '#000', padding: '15px', borderRadius: '8px', border: '1px solid #333' },
  songInfo: { display: 'flex', flexDirection: 'column', gap: '10px' },
  songTitle: { margin: 0, fontSize: '1.2rem' },
  audioPlayer: { width: '100%', height: '40px' },
  urlContainer: { display: 'flex', gap: '10px' },
  urlInput: { flex: 1, padding: '8px', backgroundColor: '#222', color: '#888', border: '1px solid #333', borderRadius: '5px', fontSize: '12px' },
  copyButton: { padding: '8px 15px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  usage: { margin: 0, color: '#666', fontSize: '12px' },
  footer: { textAlign: 'center', padding: '20px', borderTop: '1px solid #333', color: '#888', marginTop: '40px' },
};