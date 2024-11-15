import express from "express";
import {
  Register,
  Login,
  getAllUser,
  Logout,
} from "../controller/usersController.js";

import { getAllProduct } from "../controller/productsController.js";
import { verifyToken } from "../middlewares/VerifyToken.js";
import { refreshToken } from "../controller/RefreshTokenController.js";
const router = express.Router();
router.post("/api/v1/register", Register);
router.post("/api/v1/login", Login);
router.get("/api/v1/users", verifyToken, getAllUser);
router.get("/api/v1/token", refreshToken);
router.delete("/api/v1/logout", Logout);

//products
router.get("/api/v1/products", getAllProduct);

export default router;
