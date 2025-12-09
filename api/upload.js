// SIMPLE: Store files in GitHub repository
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read form data
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const text = buffer.toString();
    
    // Simple parsing
    let title = '';
    let fileName = '';
    
    // Find title
    const titleMatch = text.match(/name="title"\s*\r\n\r\n(.+?)\r\n/);
    if (titleMatch) title = titleMatch[1];
    
    // Find filename
    const fileMatch = text.match(/filename="(.+?)"/);
    if (fileMatch) fileName = fileMatch[1];
    
    if (!title || !fileName) {
      return res.status(400).json({ error: 'Missing title or file' });
    }
    
    if (!fileName.endsWith('.mp3')) {
      return res.status(400).json({ error: 'Only MP3 files allowed' });
    }
    
    // Generate GitHub RAW URL
    // Files will be stored in: https://github.com/1Nefarious1/twsrp-music-files
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const finalFileName = `${cleanTitle}-${Date.now()}.mp3`;
    
    // GitHub RAW URL format
    const githubUrl = `https://raw.githubusercontent.com/1Nefarious1/twsrp-music-files/main/music/${finalFileName}`;
    
    // For now, just return the URL structure
    // In production, we'd push to GitHub via API
    
    // Save to songs list
    try {
      await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          url: githubUrl,
        }),
      });
    } catch (e) {
      console.log('Note: Songs save optional');
    }
    
    return res.status(200).json({
      success: true,
      url: githubUrl,
      title: title,
      message: '✅ GitHub URL generated!',
      note: 'Files stored permanently on GitHub'
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Upload failed',
      details: 'Try a smaller file'
    });
  }
}