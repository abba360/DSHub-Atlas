const { Router } = require("express");
const requireAuth = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const authController = require("./auth.controller");
const { loginSchema, registerSchema, refreshSchema } = require("./auth.schemas");

const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Public intern onboarding
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Ada Lovelace
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ada@dshub.com
 *               password:
 *                 type: string
 *                 example: SecurePass123
 *     responses:
 *       201:
 *         description: Intern account created successfully
 *       409:
 *         description: User already exists
 */
router.post("/register", validate(registerSchema), authController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Log in and issue access plus refresh tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@dshub.com
 *               password:
 *                 type: string
 *                 example: SecurePass123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Rotate the refresh token and issue a new access token
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Optional fallback when cookies are not available
 *     responses:
 *       200:
 *         description: Session refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh", validate(refreshSchema), authController.refresh);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Log out and revoke the refresh session
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Optional fallback when cookies are not available
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", validate(refreshSchema), authController.logout);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user retrieved successfully
 *       401:
 *         description: Missing or invalid access token
 */
router.get("/me", requireAuth, authController.me);

module.exports = router;
