import { Router } from 'express';
import multer from 'multer';
import { ProductController } from '../../controllers/productController';
import { authenticate, requireAdmin } from '../../middlewares/authMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All product routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

router.post('/', ProductController.createProduct);
router.get('/', ProductController.getProducts);
router.get('/barcode/:code', ProductController.getProductByBarcode);
router.get('/:id', ProductController.getProductById);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

// Image upload routes
router.post(
  '/:id/images',
  upload.array('images', 10),
  ProductController.uploadImages
);

router.patch('/:id/thumbnail', ProductController.setThumbnail);

export default router;

