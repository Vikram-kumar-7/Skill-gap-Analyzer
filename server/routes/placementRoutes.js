import { Router } from 'express';
import { getWeights, updateWeights, getQuiz } from '../controllers/placementController.js';

const router = Router();

router.get('/weights', getWeights);
router.post('/weights', updateWeights);
router.get('/quiz', getQuiz);

export default router;
