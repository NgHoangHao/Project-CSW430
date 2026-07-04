import { Router } from 'express';
import { upload } from '../middlewares/fileStore';
import {createBook,getBookDetail,getBooks,getDetailByBarcode,updateBook,deleteBook,addCopyBook,deleteCopyBook} from '../controllers/bookController'
import { validateAddBook, validateAddCopyBook } from '../middlewares/bookValidate';

const bookRouters = Router();

bookRouters.post('/add-book',validateAddBook, upload.single('url'),createBook );
bookRouters.post('/add-copyBook',validateAddCopyBook,addCopyBook);
bookRouters.get('/get-book',getBooks);
bookRouters.get('/get-detail',getBookDetail)
bookRouters.get('/get-copyBook', getDetailByBarcode);
bookRouters.put('/update',validateAddBook,upload.single('url'),updateBook);
bookRouters.delete('/delete',deleteBook);
bookRouters.delete('/delete-copyBook',deleteCopyBook);
export default bookRouters;