const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// uploads aur outputs folders automatically banao so that i can track my data
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('outputs')) fs.mkdirSync('outputs');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, uuidv4() + '.docx')
});
const upload = multer({ storage });

app.post('/format', upload.single('file'), (req, res) => {
  const inputPath = path.resolve(req.file.path);
  const outputName = uuidv4() + '_formatted.docx';
  const outputPath = path.resolve('outputs', outputName);
  const docType = req.body.docType || 'book';
  const options = req.body.options || '{}';

  const optionsFile = path.resolve('uploads', uuidv4() + '_options.json');
  fs.writeFileSync(optionsFile, options);

  // Direct Power-Logic Formatting (No AI Dependency)
  const formatCommand = `python "${path.join(__dirname, 'formatter.py')}" "${inputPath}" "${outputPath}" "${docType}" "${optionsFile}"`;

  console.log('Running High-Speed Formatter:', formatCommand);

  exec(formatCommand, (fErr, fStdout, fStderr) => {
    if (fs.existsSync(optionsFile)) fs.unlinkSync(optionsFile);

    if (fErr) {
      console.error('Format Error:', fStderr);
      return res.status(500).json({ error: 'Formatting failed' });
    }
    res.download(outputPath, 'formatted_document.docx', (dlErr) => {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
