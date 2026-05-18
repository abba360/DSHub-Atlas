const { query } = require("../../config/db");

const getOverviewStats = () =>
  query(`
    SELECT
      COUNT(*)                                        AS total_users,
      COUNT(*) FILTER (WHERE role = 'intern')         AS total_interns,
      COUNT(*) FILTER (WHERE role = 'mentor')         AS total_mentors,
      COUNT(*) FILTER (WHERE role = 'admin')          AS total_admins,
      COUNT(*) FILTER (WHERE is_active = TRUE)        AS active_users,
      COUNT(*) FILTER (WHERE is_active = FALSE)       AS inactive_users
    FROM users
  `);

const getInternOverview = () =>
  query(`
    SELECT
      COUNT(*)                                        AS total_interns,
      COUNT(*) FILTER (WHERE is_active = TRUE)        AS active_interns,
      COUNT(*) FILTER (WHERE is_active = FALSE)       AS inactive_interns
    FROM interns
  `);


const getRegistrationTrend = (days = 30) =>
  query(
    `
    SELECT
      DATE_TRUNC('day', created_at) AS date,
      COUNT(*)                      AS registrations
    FROM users
    WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date ASC
    `,
    [days]
  );

/**
 * Intern profile creation grouped by day for the last N days.
 */
const getInternGrowthTrend = (days = 30) =>
  query(
    `
    SELECT
      DATE_TRUNC('day', created_at) AS date,
      COUNT(*)                      AS new_interns
    FROM interns
    WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date ASC
    `,
    [days]
  );


const getInternsByTrack = () =>
  query(`
    SELECT
      track,
      COUNT(*)                                  AS total,
      COUNT(*) FILTER (WHERE is_active = TRUE)  AS active
    FROM interns
    GROUP BY track
    ORDER BY total DESC
  `);


const getUsersByRole = () =>
  query(`
    SELECT
      role,
      COUNT(*)                                        AS total,
      COUNT(*) FILTER (WHERE is_active = TRUE)        AS active,
      COUNT(*) FILTER (WHERE is_active = FALSE)       AS inactive
    FROM users
    GROUP BY role
    ORDER BY total DESC
  `);


const getActiveSessions = () =>
  query(`
    SELECT COUNT(*) AS active_sessions
    FROM refresh_sessions
    WHERE revoked_at  IS NULL
      AND expires_at  >  NOW()
  `);


const getSessionTrend = (days = 30) =>
  query(
    `
    SELECT
      DATE_TRUNC('day', created_at) AS date,
      COUNT(*)                      AS sessions
    FROM refresh_sessions
    WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date ASC
    `,
    [days]
  );


const getTopActiveUsers = (limit = 10) =>
  query(
    `
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.role,
      COUNT(rs.id) AS session_count
    FROM users u
    JOIN refresh_sessions rs
      ON rs.user_id   = u.id
     AND rs.revoked_at IS NULL
     AND rs.expires_at > NOW()
    GROUP BY u.id, u.full_name, u.email, u.role
    ORDER BY session_count DESC
    LIMIT $1
    `,
    [limit]
  );


const getRecentlyActiveUsers = (days = 7) =>
  query(
    `
    SELECT COUNT(DISTINCT user_id) AS recently_active_users
    FROM refresh_sessions
    WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
    `,
    [days]
  );


const getCohortSummary = () =>
  query(`
    SELECT
      i.track,
      COUNT(DISTINCT i.id)                                      AS intern_profiles,
      COUNT(DISTINCT i.id) FILTER (WHERE i.is_active = TRUE)    AS active_profiles,
      COUNT(DISTINCT u.id)                                      AS user_accounts,
      COUNT(DISTINCT u.id) FILTER (WHERE u.is_active = TRUE)    AS active_accounts
    FROM interns i
    LEFT JOIN users u
      ON LOWER(u.email) = LOWER(i.email)
     AND u.role = 'intern'
    GROUP BY i.track
    ORDER BY i.track ASC
  `);

module.exports = {
  getOverviewStats,
  getInternOverview,
  getRegistrationTrend,
  getInternGrowthTrend,
  getInternsByTrack,
  getUsersByRole,
  getActiveSessions,
  getSessionTrend,
  getTopActiveUsers,
  getRecentlyActiveUsers,
  getCohortSummary,
};