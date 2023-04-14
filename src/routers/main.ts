import { Router } from 'express';
import pFilingRouter from './processedFiling';
const router = Router();
router.use('/pFiling', pFilingRouter);
export default router;
