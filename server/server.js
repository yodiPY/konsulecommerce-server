const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: '/tmp' });
const app = express();
const PORT = process.env.PORT || 3000;
const MODEL_PATH = process.env.MODEL_PATH || '/models/ggml-small.bin';
const BINARY_PATH = '/usr/local/bin/whisper'; // hardcode to avoid wrong env overrides
const WHISPER_SECRET = process.env.WHISPER_SECRET || null;

app.use(express.json({ limit: '50mb' }));

async function downloadToFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const fileStream = fs.createWriteStream(dest);
  return new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on('error', reject);
    fileStream.on('finish', resolve);
  });
}

app.post('/transcribe', upload.single('file'), async (req, res) => {
  try {
    console.log('Using whisper binary at:', BINARY_PATH);
    // Simple auth: if WHISPER_SECRET is set, require header x-whisper-key
    if (WHISPER_SECRET) {
      const key = req.headers['x-whisper-key'] || req.headers['X-Whisper-Key'];
      if (!key || String(key) !== WHISPER_SECRET) {
        console.warn('Unauthorized request to /transcribe');
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    // Validate binary & model exists
    if (!fs.existsSync(BINARY_PATH)) {
      console.error('Whisper binary not found at', BINARY_PATH);
      return res.status(500).json({ error: `Whisper binary not found at ${BINARY_PATH}` });
    }

    if (!fs.existsSync(MODEL_PATH)) {
      console.error('Model not found at', MODEL_PATH);
      return res.status(500).json({ error: `Model not found at ${MODEL_PATH}. Place ggml model in /models` });
    }

    let inputPath = null;
    if (req.file) {
      inputPath = req.file.path;
    } else if (req.body && req.body.audioUrl) {
      // download remote file
      const tmpName = `/tmp/input-${Date.now()}`;
      const ext = path.extname(req.body.audioUrl).split('?')[0] || '.webm';
      inputPath = `${tmpName}${ext}`;
      await downloadToFile(req.body.audioUrl, inputPath);
    } else if (req.body && req.body.audioBase64) {
      const data = req.body.audioBase64;
      const tmpName = `/tmp/input-${Date.now()}.webm`;
      fs.writeFileSync(tmpName, Buffer.from(data, 'base64'));
      inputPath = tmpName;
    } else {
      return res.status(400).json({ error: 'No audio provided' });
    }

    const wavPath = `/tmp/converted-${Date.now()}.wav`;
    // Convert to 16k mono WAV using ffmpeg
    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', ['-y', '-i', inputPath, '-ar', '16000', '-ac', '1', wavPath]);
      ff.on('close', (code) => {
        if (code === 0) resolve(); else reject(new Error('ffmpeg failed with ' + code));
      });
    });

    // Run whisper.cpp binary
    const args = ['-m', MODEL_PATH, '-f', wavPath, '--language', 'id'];
    const proc = spawn(BINARY_PATH, args);
    let output = '';
    proc.stdout.on('data', (chunk) => { output += chunk.toString(); });
    proc.stderr.on('data', (chunk) => { output += chunk.toString(); });

    const exitCode = await new Promise((resolve) => proc.on('close', resolve));

    // Clean up temp files
    try { fs.unlinkSync(inputPath); } catch {}
    try { fs.unlinkSync(wavPath); } catch {}

    if (exitCode !== 0) {
      return res.status(500).json({ error: 'Transcription failed', details: output });
    }

    // Try to extract transcription lines from output and return a cleaned text
    const lines = output.split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .filter(l => !/^(\[|\-|=|Loading|Memory|ggml|Allocator|FRAMES|WARN|ERROR|File|WAVE|Detected)/i.test(l))
      .filter(l => !/^(\d+:\d+:\d+)/.test(l));

    const cleaned = lines.join(' ').replace(/\s+/g, ' ').trim();

    res.json({ text: cleaned || output });
  } catch (err) {
    console.error('Error in /transcribe', err);
    res.status(500).json({ error: String(err) });
  }
});

app.get('/', (req, res) => res.send('Whisper server up. POST /transcribe'));

app.listen(PORT, () => console.log('Whisper server listening on', PORT));
