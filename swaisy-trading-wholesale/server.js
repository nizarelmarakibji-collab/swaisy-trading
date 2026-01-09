
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Serve optimized static files from the Vite 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Support Single Page Application routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server on 0.0.0.0 and the assigned Cloud Run port
app.listen(port, '0.0.0.0', () => {
  console.log(`Production server is running on http://0.0.0.0:${port}`);
});
