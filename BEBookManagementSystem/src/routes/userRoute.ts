import { Router } from 'express';
import { assignRoleUserController, deleteRoleUserController, getProfile, getUserPage, resetPasswordHandler, updateProfile,deleteUser ,verifyOtpHandler } from '../controllers/userController';
import { validateAssignAndDeleteRole, validateForgetPassword } from '../middlewares/userValidate';
import { authorize } from '../middlewares/authorize';
import {  } from '../services/userService';


const userRouters = Router();

userRouters.get('/profile', authorize(['USER', 'LIBRARIAN', 'ADMIN']), getProfile);

userRouters.get('/get-all', authorize(['LIBRARIAN', 'ADMIN']),getUserPage);

userRouters.put('/profile', authorize(['USER', 'LIBRARIAN', 'ADMIN']), updateProfile);

userRouters.post('/verify-forget', verifyOtpHandler);

userRouters.post('/forget-pass', validateForgetPassword, resetPasswordHandler);

userRouters.post('/assign-role', authorize(['ADMIN']), validateAssignAndDeleteRole, assignRoleUserController);

userRouters.post('/delete-role', authorize(['ADMIN']), validateAssignAndDeleteRole, deleteRoleUserController);

userRouters.delete("/:userId", authorize(['ADMIN']),deleteUser);

export default userRouters;