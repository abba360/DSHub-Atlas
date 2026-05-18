const { Router }       = require("express");
const requireAuth      = require("../../middlewares/auth.middleware");
const authorizeRoles   = require("../../middlewares/role.middleware");
const validate         = require("../../middlewares/validate.middleware");
const { ROLES }        = require("../../constants/roles");
const {
  createInternSchema,
  updateInternSchema,
  internIdSchema,
  listInternsSchema,
} = require("./intern.schemas");
const controller = require("./intern.controller");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Interns
 *   description: Intern profile management
 */

/**
 * @swagger
 * /api/v1/interns:
 *   get:
 *     tags: [Interns]
 *     summary: List all intern profiles
 *     description: Returns all interns. Optionally filter by track or active status. Public read access.
 *     parameters:
 *       - in: query
 *         name: track
 *         schema:
 *           type: string
 *           enum: [frontend, backend, cybersecurity, product]
 *         description: Filter by internship track
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Interns retrieved successfully
 */
router.get(
  "/",
  validate(listInternsSchema),
  controller.getAllInterns
);

/**
 * @swagger
 * /api/v1/interns/{id}:
 *   get:
 *     tags: [Interns]
 *     summary: Get a single intern profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Intern retrieved successfully
 *       404:
 *         description: Intern not found
 */
router.get(
  "/:id",
  validate(internIdSchema),
  controller.getInternById
);

/**
 * @swagger
 * /api/v1/interns:
 *   post:
 *     tags: [Interns]
 *     summary: Create an intern profile (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, track]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Ada Lovelace
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ada@dshub.com
 *               track:
 *                 type: string
 *                 enum: [frontend, backend, cybersecurity, product]
 *                 example: backend
 *               bio:
 *                 type: string
 *                 example: Passionate about building scalable APIs.
 *               github:
 *                 type: string
 *                 example: https://github.com/ada
 *               linkedin:
 *                 type: string
 *                 example: https://linkedin.com/in/ada
 *               imageUrl:
 *                 type: string
 *                 example: https://cdn.dshub.com/avatars/ada.png
 *     responses:
 *       201:
 *         description: Intern created successfully
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: Admin role required
 *       409:
 *         description: An intern with this email already exists
 */
router.post(
  "/",
  requireAuth,
  authorizeRoles(ROLES.ADMIN),
  validate(createInternSchema),
  controller.createIntern
);

/**
 * @swagger
 * /api/v1/interns/{id}:
 *   put:
 *     tags: [Interns]
 *     summary: Update an intern profile (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               track:
 *                 type: string
 *                 enum: [frontend, backend, cybersecurity, product]
 *               bio:
 *                 type: string
 *               github:
 *                 type: string
 *               linkedin:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Intern updated successfully
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Intern not found
 */
router.put(
  "/:id",
  requireAuth,
  authorizeRoles(ROLES.ADMIN),
  validate(updateInternSchema),
  controller.updateIntern
);

/**
 * @swagger
 * /api/v1/interns/{id}:
 *   delete:
 *     tags: [Interns]
 *     summary: Delete an intern profile (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Intern deleted successfully
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Intern not found
 */
router.delete(
  "/:id",
  requireAuth,
  authorizeRoles(ROLES.ADMIN),
  validate(internIdSchema),
  controller.deleteIntern
);

module.exports = router;