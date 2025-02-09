import express from 'express';
import { authValidations } from './auth.validation';
import validateRequest from '../../middlewares/validateRequest';
import { authControllers } from './auth.controller';

const router = express.Router();

// user login with proper validation
router.post(
    '/login',
      validateRequest(authValidations.loginValidationSchema),
      authControllers.loginUser,
);

export const authRoutes = router;