import express from 'express';
import multer from 'multer';
import cloudinary from '../../config/cloudinary';
import { authenticate } from '../../middlewares/authMiddleware';

const router = express.Router();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.post('/upload', authenticate, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Convert buffer to base64
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      folder: 'meridukaan',
      resource_type: 'auto',
    });

    res.status(200).json({
      success: true,
      data: {
        url: uploadResponse.secure_url,
        public_id: uploadResponse.public_id,
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
