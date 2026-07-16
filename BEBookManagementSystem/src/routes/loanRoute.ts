import { Router } from 'express';
import { LoanController } from '../controllers/loanController';
import { authorize } from '../middlewares/authorize';


const loanRouters = Router();

loanRouters.post('/create-loan', authorize(['USER', 'LIBRARIAN', 'ADMIN']), LoanController.createLoan);
loanRouters.post('/return-book', authorize(['USER', 'LIBRARIAN', 'ADMIN']), LoanController.returnBookByBarcode);
loanRouters.get('/get-loan', authorize(['USER', 'LIBRARIAN', 'ADMIN']), LoanController.getAllLoanByUserId);
loanRouters.get('/get-loan-detail/:loanId', authorize(['USER', 'LIBRARIAN', 'ADMIN']), LoanController.getLoanDetailByLoanId);
loanRouters.get('/get-all-loan-details', authorize(['LIBRARIAN', 'ADMIN']), LoanController.getAllLoanDetailsByPage);
loanRouters.get('/get-loan-details-pagination', authorize(['LIBRARIAN', 'ADMIN']), LoanController.getAllLoanDetailsByPage);

export default loanRouters;