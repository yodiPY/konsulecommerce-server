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
const BINARY_PATH = process.env.BINARY_PATH || '/usr/local/bin/whisper'; // FIXED
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
    if (WHISPER_SECRET) {
      const key = req.headers['x-whisper-key'];
      if (!key || String(key) !== WHISPER_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    if (!fs.existsSync(MODEL_PATH)) {
      return res.status(500).json({ error: `Model not found at ${MODEL_PATH}` });
    }

    let inputPath = null;

    if (req.file) {
      inputPath = req.file.path;
    } else if (req.body.audioUrl) {
      const tmp = `/tmp/input-${Date.now()}`;
      const ext = path.extname(req.body.audioUrl).split('?')[0] || '.webm';
      inputPath = tmp + ext;
      await downloadToFile(req.body.audioUrl, inputPath);
    } else if (req.body.audioBase64) {
      const tmp = `/tmp/input-${Date.now()}.webm`;
      fs.writeFileSync(tmp, Buffer.from(req.body.audioBase64, 'base64'));
      inputPath = tmp;
    } else {
      return res.status(400).json({ error: 'No audio provided' });
    }

    const wavPath = `/tmp/converted-${Date.now()}.wav`;

    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', ['-y', '-i', inputPath, '-ar', '16000', '-ac', '1', wavPath]);
      ff.on('close', (code) => code === 0 ? resolve() : reject('ffmpeg failed ' + code));
    });

    const args = ['-m', MODEL_PATH, '-f', wavPath, '--language', 'id'];

    const proc = spawn(BINARY_PATH, args);
    let output = '';

    proc.stdout.on('data', chunk => output += chunk.toString());
    proc.stderr.on('data', chunk => output += chunk.toString());

    const exit = await new Promise(r => proc.on('close', r));

    fs.unlink(inputPath, () => {});
    fs.unlink(wavPath, () => {});

    if (exit !== 0) {
      return res.status(500).json({ error: 'Transcription failed', details: output });
    }

    const lines = output.split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l && !/^(Loading|Memory|ggml|Allocator|WARN|ERROR|File|Detected)/i.test(l))
      .filter(l => !/^\d{2}:\d{2}:\d{2}/.test(l));

    res.json({ text: lines.join(' ').trim() || output });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.get('/', (req, res) => res.send('Whisper server up. POST /transcribe'));

app.listen(PORT, () => console.log('Whisper server listening on', PORT));
