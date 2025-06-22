// pages/api/upload.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const formidable = await import('formidable');
  const fs = await import('fs/promises');

  const form = formidable.default({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Error parsing file' });

    const file = files.file[0];

    const cloudinary = await import('cloudinary');
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
      const result = await cloudinary.v2.uploader.upload(file.filepath, {
        folder: 'stok-barang',
        use_filename: true,
        unique_filename: false,
      });
      return res.status(200).json({ url: result.secure_url });
    } catch (uploadErr) {
      return res.status(500).json({ error: 'Upload failed', detail: uploadErr.message });
    }
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
