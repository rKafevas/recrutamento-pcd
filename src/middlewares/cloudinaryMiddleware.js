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
    const resourceType = req.file.fieldname === 'foto' ? 'image' : 'raw';

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          public_id: `${req.file.fieldname}-${req.usuarioId}-${Date.now()}`
        },
        (err, r) => err ? reject(err) : resolve(r)
      ).end(req.file.buffer);
    });

    req.file.path = result.secure_url;
    req.file.filename = result.public_id;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = uploadToCloudinary;
