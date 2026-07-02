import { Router } from "express";
import { createRolesController } from "../controllers/roleController";

const roleRoute = Router();

roleRoute.post('/create', createRolesController);

export default roleRoute;