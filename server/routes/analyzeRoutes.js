import { Router } from 'express';
import multer from 'multer';
import { analyze } from '../controllers/analyzeController.js';

const router = Router();

// Configure multer for in-memory PDF storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// POST /api/analyze — accepts multipart form with resume PDF + job description
router.post('/', upload.single('resume'), analyze);

export default router;
