import express from 'express';
import {authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile} from '../controllers/userController.js';

import { protect } from '../middleware/authMiddleware.js';

const userRoutes = express.Router();

userRoutes.post('/', registerUser);
userRoutes.post('/auth', authUser);
userRoutes.post('/logout', logoutUser);
userRoutes.get('/profile',protect, getUserProfile);
userRoutes.put('/profile',protect, updateUserProfile);

export default userRoutes;