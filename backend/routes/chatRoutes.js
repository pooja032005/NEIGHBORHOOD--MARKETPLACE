const express = require('express');
const router = express.Router();
const { auth } = require('../utils/authMiddleware');
const ChatController = require('../controllers/Chat');
const multer = require('multer');
const path = require('path');

// Multer storage config
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

router.post('/start', auth, ChatController.startChat);
router.get('/', auth, ChatController.getChats);
router.get('/:chatId/messages', auth, ChatController.getMessages);
router.post('/:chatId/message', auth, ChatController.sendMessage);
router.patch('/:chatId/read', auth, ChatController.markRead);
router.post('/:chatId/upload', auth, upload.single('file'), ChatController.uploadMedia);
router.get('/admin/all', auth, ChatController.getAllChats);

module.exports = router;
