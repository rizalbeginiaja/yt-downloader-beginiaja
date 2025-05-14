const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

app.get('/api', (req, res) => {
  const { url } = req.query;

  if (!url || !url.includes("youtube.com")) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  const cmd = `yt-dlp -j "${url}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return res.status(500).json({ error: "Failed to fetch video info" });
    }

    try {
      const lines = stdout.split('\n');
      const info = JSON.parse(lines[lines.length - 2]); // yt-dlp output biasanya di baris kedua dari akhir
      const formats = info.formats.map(f => ({
        qualityLabel: f.format_note,
        type: f.mimetype,
        url: f.url
      }));

      res.json({ formats });
    } catch (parseError) {
      res.status(500).json({ error: "Failed to parse response" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});