import { Router } from "express";
import { createRolesController, getAllRolesController } from "../controllers/roleController";
import { addRoleValidate } from "../middlewares/roleValidate";
import { authorize } from "../middlewares/authorize";

const roleRoute = Router();

roleRoute.post('/create', authorize(['ADMIN']), addRoleValidate, createRolesController);

roleRoute.get('/get-all', authorize(['ADMIN']), getAllRolesController);

export default roleRoute;