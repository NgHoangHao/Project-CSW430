import { Router } from 'express';
import { assignRoleUserController, deleteRoleUserController, getProfile, resetPasswordHandler, updateProfile, verifyOtpHandler } from '../controllers/userController';
import { validateAssignAndDeleteRole, validateForgetPassword } from '../middlewares/userValidate';
import { authorize } from '../middlewares/authorize';


const userRouters = Router();

userRouters.get('/profile', authorize(['USER', 'LIBRARIAN', 'ADMIN']), getProfile);

userRouters.put('/profile',authorize(['USER', 'LIBRARIAN', 'ADMIN']),updateProfile);

userRouters.post('/verify-forget', verifyOtpHandler);

userRouters.post('/forget-pass', validateForgetPassword, resetPasswordHandler);

userRouters.post('/assign-role', authorize(['ADMIN']), validateAssignAndDeleteRole, assignRoleUserController);

userRouters.post('/delete-role', authorize(['ADMIN']), validateAssignAndDeleteRole, deleteRoleUserController);

export default userRouters;