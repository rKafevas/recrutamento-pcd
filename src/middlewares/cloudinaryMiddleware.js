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

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          public_id: `${req.file.fieldname}-${req.usuarioId}-${Date.now()}`
        },
        (err, r) => err ? reject(err) : resolve(r)
      ).end(req.file.buffer);
    });

    // URL assinada sem expiração — contorna restrições de acesso da conta Cloudinary
    const signedUrl = cloudinary.url(result.public_id, {
      resource_type: 'image',
      secure: true,
      sign_url: true,
      type: 'upload',
      format: result.format,
    });

    req.file.path = signedUrl;
    req.file.filename = result.public_id;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = uploadToCloudinary;
