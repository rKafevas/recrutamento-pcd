const multer = require('multer');
const path = require('path');

// Configuração de onde o arquivo será salvo e com qual nome
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/laudos/'); // Certifique-se de criar esta pasta!
  },
  filename: (req, file, cb) => {
    // Criamos um nome único: ID do Usuário + Timestamp + Extensão original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `laudo-${req.usuarioId}-${uniqueSuffix}${path.extname(file.originalname)}`);
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