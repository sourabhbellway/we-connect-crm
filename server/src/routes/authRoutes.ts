import express from "express";
import { login, getProfile, register } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";
import { loginValidation } from "../validators/authValidators";

const router = express.Router();

router.post("/login", loginValidation, login);
router.post("/register", register);
router.get("/profile", authenticateToken, getProfile);

export default router;
