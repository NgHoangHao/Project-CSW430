import { Router } from 'express';
import { LoanController } from '../controllers/loanController';
import { authorize } from '../middlewares/authorize';


const loanRouters = Router();

loanRouters.post('/create-loan', authorize(['USER', 'LIBRARIAN', 'ADMIN']), LoanController.createLoan);
loanRouters.post('/return-book', authorize(['USER', 'LIBRARIAN', 'ADMIN']), LoanController.returnBookByBarcode);

loanRouters.get('/get-loan', authorize(['USER', 'LIBRARIAN', 'ADMIN']), LoanController.getAllLoanByUserId);

export default loanRouters;