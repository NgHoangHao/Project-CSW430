import { Router } from 'express';
import { LoanController } from '../controllers/loanController';
import { authorize } from '../middlewares/authorize';


const loanRouters = Router();

loanRouters.post('/create-loan', authorize(['USER', 'LIBRARIAN', 'ADMIN']), LoanController.createLoan);
loanRouters.post('/confirm-loan', authorize(['LIBRARIAN', 'ADMIN']), LoanController.confirmLoan);
loanRouters.post('/return-book', authorize(['USER', 'LIBRARIAN', 'ADMIN']), LoanController.returnBookByBarcode);
loanRouters.get('/get-loan', authorize(['USER', 'LIBRARIAN', 'ADMIN']), LoanController.getAllLoanByUserId);
loanRouters.get('/get-loan-detail/:loanId', authorize(['USER', 'LIBRARIAN', 'ADMIN']), LoanController.getLoanDetailByLoanId);
loanRouters.get('/get-all-loan-details', authorize(['LIBRARIAN', 'ADMIN']), LoanController.getAllLoanDetails);
loanRouters.get('/get-loan-by-status/:status', authorize(['LIBRARIAN', 'ADMIN']), LoanController.getLoanByStatus);
loanRouters.get('/loan-detail',authorize(['USER', 'LIBRARIAN', 'ADMIN']), LoanController.getLoanDetails);
loanRouters.get('/loan-home',authorize(['USER', 'LIBRARIAN', 'ADMIN']),LoanController.getHomeData);
loanRouters.post('/send-email-notice', authorize(['LIBRARIAN', 'ADMIN']), LoanController.sendLoanEmailNotice);

export default loanRouters;