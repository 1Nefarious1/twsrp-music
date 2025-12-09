// Simple in-memory storage
let songs = [];

// Add sample songs for testing
songs.push(
  {
    id: 1,
    title: "Example Song 1",
    url: "https://raw.githubusercontent.com/1Nefarious1/twsrp-music-files/main/music/example1.mp3",
    uploaded_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Example Song 2",
    url: "https://raw.githubusercontent.com/1Nefarious1/twsrp-music-files/main/music/example2.mp3",
    uploaded_at: new Date().toISOString()
  }
);

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(songs);
  }
  
  if (req.method === 'POST') {
    try {
      const { title, url } = req.body;
      
      if (!title || !url) {
        return res.status(400).json({ error: 'Missing data' });
      }
      
      const newSong = {
        id: Date.now(),
        title: title,
        url: url,
        uploaded_at: new Date().toISOString(),
      };
      
      songs.unshift(newSong);
      return res.status(200).json({ success: true, song: newSong });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}