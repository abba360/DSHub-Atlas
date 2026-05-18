const { Router }     = require("express");
const { z }          = require("zod");
const requireAuth    = require("../../middlewares/auth.middleware");
const authorizeRoles = require("../../middlewares/role.middleware");
const validate       = require("../../middlewares/validate.middleware");
const { ROLES }      = require("../../constants/roles");
const controller     = require("./analytics.controller");

const router = Router();


const trendsSchema = z.object({
  body:   z.object({}).optional(),
  params: z.object({}).optional(),
  query:  z.object({
    days: z
      .string()
      .regex(/^\d+$/, "days must be a positive integer")
      .transform(Number)
      .refine((n) => n >= 1 && n <= 365, "days must be between 1 and 365")
      .optional(),
  }),
});

const engagementSchema = z.object({
  body:   z.object({}).optional(),
  params: z.object({}).optional(),
  query:  z.object({
    limit: z
      .string()
      .regex(/^\d+$/, "limit must be a positive integer")
      .transform(Number)
      .refine((n) => n >= 1 && n <= 50, "limit must be between 1 and 50")
      .optional(),
  }),
});

// All analytics routes require authentication and admin role
router.use(requireAuth, authorizeRoles(ROLES.ADMIN));

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Dashboard analytics and platform metrics (admin only)
 */

/**
 * @swagger
 * /api/v1/analytics/overview:
 *   get:
 *     tags: [Analytics]
 *     summary: Platform overview — top-level stat cards
 *     description: >
 *       Returns aggregated counts for users, interns, and active sessions.
 *       Intended for the stat card row at the top of the admin dashboard.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:    { type: integer, example: 42 }
 *                         active:   { type: integer, example: 38 }
 *                         inactive: { type: integer, example: 4  }
 *                         byRole:
 *                           type: object
 *                           properties:
 *                             admin:  { type: integer, example: 2  }
 *                             mentor: { type: integer, example: 5  }
 *                             intern: { type: integer, example: 35 }
 *                     interns:
 *                       type: object
 *                       properties:
 *                         total:    { type: integer, example: 30 }
 *                         active:   { type: integer, example: 28 }
 *                         inactive: { type: integer, example: 2  }
 *                     sessions:
 *                       type: object
 *                       properties:
 *                         currentlyActive:      { type: integer, example: 12 }
 *                         activeUsersLast7Days: { type: integer, example: 20 }
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: Admin role required
 */
router.get("/overview", controller.getOverview);

/**
 * @swagger
 * /api/v1/analytics/tracks:
 *   get:
 *     tags: [Analytics]
 *     summary: Intern count and cohort status broken down by track
 *     description: >
 *       Returns per-track intern profile counts joined with user account
 *       counts. Use this for the track comparison bar chart.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Track breakdown retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     tracks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           track:          { type: string,  example: backend }
 *                           internProfiles: { type: integer, example: 12      }
 *                           activeProfiles: { type: integer, example: 10      }
 *                           userAccounts:   { type: integer, example: 11      }
 *                           activeAccounts: { type: integer, example: 10      }
 *                     totals:
 *                       type: object
 *                       properties:
 *                         internProfiles: { type: integer, example: 40 }
 *                         activeProfiles: { type: integer, example: 36 }
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: Admin role required
 */
router.get("/tracks", controller.getTrackBreakdown);

/**
 * @swagger
 * /api/v1/analytics/roles:
 *   get:
 *     tags: [Analytics]
 *     summary: User account distribution by role
 *     description: >
 *       Returns total, active, and inactive counts for each role.
 *       Use this for the role distribution pie chart.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role distribution retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       role:     { type: string,  example: intern }
 *                       total:    { type: integer, example: 35     }
 *                       active:   { type: integer, example: 32     }
 *                       inactive: { type: integer, example: 3      }
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: Admin role required
 */
router.get("/roles", controller.getRoleDistribution);

/**
 * @swagger
 * /api/v1/analytics/trends:
 *   get:
 *     tags: [Analytics]
 *     summary: Registration, intern growth, and session trends over time
 *     description: >
 *       Returns three time-series arrays for the given period.
 *       Use this for line charts showing platform activity over time.
 *       Defaults to the last 30 days; supports up to 365.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Number of past days to include in the trend window
 *     responses:
 *       200:
 *         description: Trend data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: object
 *                       properties:
 *                         days: { type: integer, example: 30 }
 *                     registrations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:  { type: string,  example: "2026-04-01" }
 *                           count: { type: integer, example: 3            }
 *                     internGrowth:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:  { type: string,  example: "2026-04-01" }
 *                           count: { type: integer, example: 2            }
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:  { type: string,  example: "2026-04-01" }
 *                           count: { type: integer, example: 8            }
 *       400:
 *         description: Invalid query parameter
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: Admin role required
 */
router.get("/trends", validate(trendsSchema), controller.getTrends);

/**
 * @swagger
 * /api/v1/analytics/engagement:
 *   get:
 *     tags: [Analytics]
 *     summary: User engagement — recently active users and top session counts
 *     description: >
 *       Returns users active in the last 7 days and a leaderboard of the
 *       most active users by live session count. Use limit to control
 *       leaderboard size (default 10, max 50).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of top users to return
 *     responses:
 *       200:
 *         description: Engagement data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     recentlyActiveUsers:
 *                       type: integer
 *                       example: 18
 *                     topActiveUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:           { type: string,  format: uuid     }
 *                           fullName:     { type: string,  example: Ada L.  }
 *                           email:        { type: string,  format: email    }
 *                           role:         { type: string,  example: intern  }
 *                           sessionCount: { type: integer, example: 5       }
 *       400:
 *         description: Invalid query parameter
 *       401:
 *         description: Missing or invalid access token
 *       403:
 *         description: Admin role required
 */
router.get("/engagement", validate(engagementSchema), controller.getEngagement);

module.exports = router;