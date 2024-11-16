const path = require('path');
const multer = require('multer');

const file_storage_destination = process.env.MULTERDIR;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, file_storage_destination); // Set the directory where files will be saved
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Save files with the current timestamp and original extension
    }
});

// Initialize multer with the storage options
const upload = multer({ storage: storage });

module.exports = {
    upload
}