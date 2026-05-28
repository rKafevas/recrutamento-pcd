const cloudinary = require('cloudinary').v2;
const path = require('path');

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
    const isFoto = req.file.fieldname === 'foto';
    const resourceType = isFoto ? 'image' : 'raw';
    const ext = isFoto ? '' : (path.extname(req.file.originalname).toLowerCase() || '.pdf');

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          public_id: `${req.file.fieldname}-${req.usuarioId}-${Date.now()}${ext}`
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
