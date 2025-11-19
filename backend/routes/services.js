const express = require("express");
const router = express.Router();

const { 
  createService, 
  getServices, 
  getServiceById,
  bookService,
  getProviderContact
} = require("../controllers/serviceController");

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});
const upload = multer({ storage });

const { auth } = require("../utils/authMiddleware");

// Accept multipart/form-data with optional 'image' file
router.post("/create", auth, upload.single('image'), createService);
router.get("/", getServices);
router.get("/:id", getServiceById);
router.post("/:serviceId/book", auth, bookService);
router.get("/:serviceId/contact", getProviderContact);

module.exports = router;
