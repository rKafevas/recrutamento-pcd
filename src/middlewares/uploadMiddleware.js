const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Separa pasta por tipo de arquivo
    if (file.fieldname === 'curriculo') {
      cb(null, 'uploads/curriculos/');
    } else {
      cb(null, 'uploads/laudos/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.fieldname === 'curriculo' ? 'curriculo' : 'laudo';
    cb(null, `${prefix}-${req.usuarioId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Filtro para aceitar apenas PDF ou Imagens
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Envie PDF ou Imagem.'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});

module.exports = upload;