const queries = require("./analytics.queries");


const int  = (v) => parseInt(v, 10) || 0;
const isoDate = (v) => (v ? new Date(v).toISOString().split("T")[0] : null);


const getOverview = async () => {
  const [usersResult, internsResult, sessionsResult, recentResult] =
    await Promise.all([
      queries.getOverviewStats(),
      queries.getInternOverview(),
      queries.getActiveSessions(),
      queries.getRecentlyActiveUsers(7),
    ]);

  const u = usersResult.rows[0];
  const i = internsResult.rows[0];
  const s = sessionsResult.rows[0];
  const r = recentResult.rows[0];

  return {
    users: {
      total:    int(u.total_users),
      active:   int(u.active_users),
      inactive: int(u.inactive_users),
      byRole: {
        admin:  int(u.total_admins),
        mentor: int(u.total_mentors),
        intern: int(u.total_interns),
      },
    },
    interns: {
      total:    int(i.total_interns),
      active:   int(i.active_interns),
      inactive: int(i.inactive_interns),
    },
    sessions: {
      currentlyActive:       int(s.active_sessions),
      activeUsersLast7Days:  int(r.recently_active_users),
    },
  };
};


const getTrackBreakdown = async () => {
  const [trackResult, cohortResult] = await Promise.all([
    queries.getInternsByTrack(),
    queries.getCohortSummary(),
  ]);

  // Index cohort summary by track for O(1) merge
  const cohortByTrack = cohortResult.rows.reduce((acc, row) => {
    acc[row.track] = row;
    return acc;
  }, {});

  const tracks = trackResult.rows.map((row) => {
    const cohort = cohortByTrack[row.track] || {};
    return {
      track:           row.track,
      internProfiles:  int(row.total),
      activeProfiles:  int(row.active),
      userAccounts:    int(cohort.user_accounts   ?? 0),
      activeAccounts:  int(cohort.active_accounts ?? 0),
    };
  });

  return {
    tracks,
    totals: {
      internProfiles: tracks.reduce((sum, t) => sum + t.internProfiles, 0),
      activeProfiles: tracks.reduce((sum, t) => sum + t.activeProfiles, 0),
    },
  };
};


const getRoleDistribution = async () => {
  const result = await queries.getUsersByRole();

  return result.rows.map((row) => ({
    role:     row.role,
    total:    int(row.total),
    active:   int(row.active),
    inactive: int(row.inactive),
  }));
};


const getTrends = async (days = 30) => {
  const parsedDays = Math.min(Math.max(int(days), 1), 365); // clamp 1–365

  const [regResult, internResult, sessionResult] = await Promise.all([
    queries.getRegistrationTrend(parsedDays),
    queries.getInternGrowthTrend(parsedDays),
    queries.getSessionTrend(parsedDays),
  ]);

  const toSeries = (rows, countKey) =>
    rows.map((row) => ({
      date:  isoDate(row.date),
      count: int(row[countKey]),
    }));

  return {
    period:        { days: parsedDays },
    registrations: toSeries(regResult.rows,     "registrations"),
    internGrowth:  toSeries(internResult.rows,  "new_interns"),
    sessions:      toSeries(sessionResult.rows, "sessions"),
  };
};


const getEngagement = async (limit = 10) => {
  const parsedLimit = Math.min(Math.max(int(limit), 1), 50); // clamp 1–50

  const [activeResult, recentResult] = await Promise.all([
    queries.getTopActiveUsers(parsedLimit),
    queries.getRecentlyActiveUsers(7),
  ]);

  const topUsers = activeResult.rows.map((row) => ({
    id:           row.id,
    fullName:     row.full_name,
    email:        row.email,
    role:         row.role,
    sessionCount: int(row.session_count),
  }));

  return {
    recentlyActiveUsers: int(recentResult.rows[0]?.recently_active_users ?? 0),
    topActiveUsers:      topUsers,
  };
};

module.exports = {
  getOverview,
  getTrackBreakdown,
  getRoleDistribution,
  getTrends,
  getEngagement,
};