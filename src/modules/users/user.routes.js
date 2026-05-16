const { Router } = require("express");
const requireAuth = require("../../middlewares/auth.middleware");
const authorizeRoles = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const { ROLES } = require("../../constants/roles");
const { createUserSchema } = require("./user.schemas");
const userController = require("./user.controller");

const router = Router();

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: Admin view of provisioned platform users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: Admin role required
 */
router.get("/", requireAuth, authorizeRoles(ROLES.ADMIN), userController.listUsers);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     tags: [Users]
 *     summary: Admin account provisioning for mentors, interns, and admins
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password, role]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Grace Hopper
 *               email:
 *                 type: string
 *                 format: email
 *                 example: grace@dshub.com
 *               password:
 *                 type: string
 *                 example: SecurePass123
 *               role:
 *                 type: string
 *                 enum: [admin, mentor, intern]
 *                 example: mentor
 *     responses:
 *       201:
 *         description: User created successfully
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: Admin role required
 *       409:
 *         description: User already exists
 */
router.post(
  "/",
  requireAuth,
  authorizeRoles(ROLES.ADMIN),
  validate(createUserSchema),
  userController.createUser
);

module.exports = router;
