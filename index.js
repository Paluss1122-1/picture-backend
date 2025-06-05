require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.post('/upload', upload.single('image'), async (req, res) => {
  const file = req.file;
  const category = req.body.category || 'default';
  const filePath = `${category}/${Date.now()}_${file.originalname}`;

  const { error } = await supabase
    .storage
    .from('bilder')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (error) return res.status(500).json({ success: false, error: error.message });

  const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/bilder/${filePath}`;
  res.json({ success: true, url: publicUrl });
});

app.listen(3000, () => {
  console.log('Server läuft auf Port 3000');
});
