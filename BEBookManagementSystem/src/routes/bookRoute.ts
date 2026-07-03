import { Router } from 'express';
import { upload } from '../middlewares/fileStore';
import {createBook,getBookDetail,getBooks,getDetailByBarcode} from '../controllers/bookController'

const bookRouters = Router();

bookRouters.post('/add-book', upload.single('url'),createBook );
bookRouters.get('/get-book',getBooks);
bookRouters.get('/get-detail',getBookDetail)
bookRouters.get('/get-copyBook', getDetailByBarcode);

export default bookRouters;