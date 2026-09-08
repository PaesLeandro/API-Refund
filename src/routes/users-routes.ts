import { Router } from "express";
import { UsersController } from "@/controllers/users-controller";

const userRoutes = Router();
const usersController = new UsersController();

userRoutes.post("/", usersController.create);

export { userRoutes };