const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { deleteFileByPath } = require('../utils/deleteFiles');

function createUploadMiddleware(subfolder = '', id = Date.now(), nameOfFile = '') {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join('uploads', subfolder);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueName = `${Date.now().toString()}-${id}-${file.originalname}`;
      cb(null, uniqueName);
    }
  });

  return multer({ storage });
}

module.exports = createUploadMiddleware;