const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const eminentSpeakerController = require('../controllers/eminentSpeakerController');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/speakers');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for speaker photos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'speaker-' + uniqueSuffix + extension);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

// Middleware for handling multer errors
const handleMulterErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'FILE_TOO_LARGE',
                message: 'File size should not exceed 5MB',
                code: 'EM_014'
            });
        }
        return res.status(400).json({
            error: 'UPLOAD_ERROR',
            message: err.message,
            code: 'EM_015'
        });
    } else if (err) {
        return res.status(400).json({
            error: 'INVALID_FILE',
            message: err.message,
            code: 'EM_016'
        });
    }
    next();
};

// Routes
router.post('/', upload.single('speaker_photo'), handleMulterErrors, eminentSpeakerController.createEminentSpeaker);
router.get('/', eminentSpeakerController.getAllEminentSpeakers);
router.get('/:id', eminentSpeakerController.getEminentSpeakerById);
router.put('/:id', upload.single('speaker_photo'), handleMulterErrors, eminentSpeakerController.updateEminentSpeaker);
router.delete('/:id', eminentSpeakerController.deleteEminentSpeaker);

module.exports = router;