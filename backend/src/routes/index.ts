import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import { ProfileController } from '../controllers/profile';
import { FootprintController } from '../controllers/footprint';
import { RecommendationController } from '../controllers/recommendation';
import { GoalController } from '../controllers/goal';
import { ChatController } from '../controllers/chat';
import { AnalyticsController } from '../controllers/analytics';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Auth Routes
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authenticateJWT, AuthController.me);

// Profile Routes
router.get('/profile', authenticateJWT, ProfileController.getProfile);
router.put('/profile', authenticateJWT, ProfileController.updateProfile);

// Footprint Routes
router.get('/footprint/history', authenticateJWT, FootprintController.getHistory);
router.post('/footprint/calculate', authenticateJWT, FootprintController.calculateCustom);

// Recommendation Routes
router.get('/recommendations', authenticateJWT, RecommendationController.getRecommendations);
router.post('/recommendations/action', authenticateJWT, RecommendationController.performAction);

// Goal Routes
router.get('/goals', authenticateJWT, GoalController.getGoals);
router.post('/goals', authenticateJWT, GoalController.createGoal);

// Chat Routes
router.get('/chat/history', authenticateJWT, ChatController.getHistory);
router.post('/chat', authenticateJWT, ChatController.sendMessage);

// Analytics Routes
router.get('/analytics/summary', authenticateJWT, AnalyticsController.getSummary);

export default router;
