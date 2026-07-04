import { Router } from 'express';
import { upload } from '../middlewares/fileStore';
import {createBook,getBookDetail,getBooks,getDetailByBarcode,updateBook,deleteBook} from '../controllers/bookController'
import { validateAddBook } from '../middlewares/bookValidate';

const bookRouters = Router();

bookRouters.post('/add-book',validateAddBook, upload.single('url'),createBook );
bookRouters.get('/get-book',getBooks);
bookRouters.get('/get-detail',getBookDetail)
bookRouters.get('/get-copyBook', getDetailByBarcode);
bookRouters.put('/update',validateAddBook,upload.single('url'),updateBook);
bookRouters.delete('/delete',deleteBook);
export default bookRouters;