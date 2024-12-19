import express from "express";
import multer from "multer";
import {
  Register,
  Login,
  getAllUser,
  Logout,
  changePassword,
  editUser,
  changeProfile,
} from "../controller/usersController.js";

import {
  getAllCart,
  changeQTY,
  deleteAllItem,
  saveCart,
  deleteSingleItem,
} from "../controller/cartController.js";

import {
  getAllOrders,
  getOrdersById,
  makeShippingAddress,
  getShippingAddress,
  getShippingAddressById,
  updateStatus,
} from "../controller/orderController.js";

import {
  processTransaction,
  paymentSuccess,
} from "../controller/paymentController.js";

import {
  getAllProduct,
  getPopulerProduct,
  getProductById,
  getAllCategories,
  getSubcategory,
  getAllSpecificSubcategories,
} from "../controller/productsController.js";

import {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
} from "../controller/FavoriteController.js";

import { verifyToken } from "../middlewares/VerifyToken.js";
import { refreshToken } from "../controller/RefreshTokenController.js";
const router = express.Router();
const upload = multer({ dest: "uploads/" });

//users
router.post("/api/v1/register", Register);
router.put("/api/v1/:id/change-password", changePassword);
router.post("/api/v1/login", Login);
router.get("/api/v1/users", verifyToken, getAllUser);
router.get("/api/v1/token", refreshToken);
router.delete("/api/v1/logout", Logout);
router.put("/api/v1/editUser/:id", verifyToken, editUser);
router.post(
  "/api/v1/editProfile/:id",
  verifyToken,
  upload.single("image"),
  changeProfile
);

//products
router.get("/api/v1/products", getAllProduct);
router.get("/api/v1/product/:id", getProductById);
router.get("/api/v1/categories", getAllCategories);
router.get("/api/v1/subcategory", getSubcategory);
router.get("/api/v1/specific-subcategories", getAllSpecificSubcategories);

//favorite
router.get("/favorites", verifyToken, getUserFavorites);
router.post("/favorites", verifyToken, addToFavorites);
router.delete("/favorites", verifyToken, removeFromFavorites);

//Cart
router.get("/api/v1/checkout", verifyToken, getAllCart);
router.post("/api/v1/checkout", verifyToken, saveCart);
router.put("/api/v1/checkout/update", verifyToken, changeQTY);
router.delete("/api/v1/checkout/delete", verifyToken, deleteAllItem);
router.delete("/api/v1/checkout/delete/:id", verifyToken, deleteSingleItem);

//order
router.get("/api/v1/order", verifyToken, getAllOrders);
router.get("/api/v1/order/:id", verifyToken, getOrdersById);
router.put("/api/v1/status", verifyToken, updateStatus);
router.post("/api/v1/shipping", verifyToken, makeShippingAddress);
router.get("/api/v1/shipping", verifyToken, getShippingAddress);
router.get("/api/v1/shipping/:id", verifyToken, getShippingAddressById);

//payment
router.post("/api/v1/transaction", verifyToken, processTransaction);
router.post("/api/v1/transaction/success", verifyToken, paymentSuccess);

export default router;
