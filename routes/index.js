import express from "express";
import {
  Register,
  Login,
  getAllUser,
  Logout,
} from "../controller/usersController.js";

import {
  getAllProduct,
  getPopulerProduct,
  getProductById,
} from "../controller/productsController.js";

import {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
} from "../controller/FavoriteController.js";


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
router.get("/api/v1/product/:id", getProductById);
router.get("/api/v1/products/popular", getPopulerProduct);

//favorite
router.get("/favorites", verifyToken, getUserFavorites); 
router.post("/favorites", verifyToken, addToFavorites);
router.delete("/favorites", verifyToken, removeFromFavorites);

export default router;
