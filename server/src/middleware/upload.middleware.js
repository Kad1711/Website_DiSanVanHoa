const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Chỉ chấp nhận ảnh (jpeg, png, webp, gif).'), false);
};

const videoFilter = (req, file, cb) => {
  const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Chỉ chấp nhận video (mp4, webm, mov, avi).'), false);
};

const anyFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg','image/jpg','image/png','image/webp','image/gif',
    'video/mp4','video/webm','video/quicktime','video/x-msvideo',
  ];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Định dạng file không được hỗ trợ.'), false);
};

const uploadImage = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadVideo = multer({ storage, fileFilter: videoFilter, limits: { fileSize: 500 * 1024 * 1024 } });
const uploadAny   = multer({ storage, fileFilter: anyFilter,   limits: { fileSize: 500 * 1024 * 1024 } });

module.exports = { uploadImage, uploadVideo, uploadAny };
