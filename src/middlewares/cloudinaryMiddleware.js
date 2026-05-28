const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const folderMap = { curriculo: 'curriculos', foto: 'fotos', laudo: 'laudos' };

async function uploadToCloudinary(req, res, next) {
  if (!req.file) return next();
  try {
    const folder = folderMap[req.file.fieldname] || 'uploads';
    const isDoc = req.file.fieldname !== 'foto'; // laudo e curriculo são documentos privados

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          type: isDoc ? 'private' : 'upload',
          public_id: `${req.file.fieldname}-${req.usuarioId}-${Date.now()}`
        },
        (err, r) => err ? reject(err) : resolve(r)
      ).end(req.file.buffer);
    });

    let url;
    if (isDoc) {
      // private_download_url usa api.cloudinary.com com autenticação por API key —
      // contorna restrições de entrega CDN que afetam signed URLs normais
      url = cloudinary.utils.private_download_url(
        result.public_id,
        result.format,
        {
          resource_type: 'image',
          type: 'private',
          expires_at: Math.floor(Date.now() / 1000) + 365 * 24 * 3600, // 1 ano
          attachment: false,
        }
      );
    } else {
      url = result.secure_url;
    }

    req.file.path = url;
    req.file.filename = result.public_id;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = uploadToCloudinary;
