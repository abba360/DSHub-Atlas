const asyncHandler = require("../../utils/async-handler");
const service      = require("./analytics.service");


const getOverview = asyncHandler(async (req, res) => {
  const data = await service.getOverview();

  res.status(200).json({
    success: true,
    message: "Overview statistics retrieved successfully",
    data,
  });
});


const getTrackBreakdown = asyncHandler(async (req, res) => {
  const data = await service.getTrackBreakdown();

  res.status(200).json({
    success: true,
    message: "Track breakdown retrieved successfully",
    data,
  });
});


const getRoleDistribution = asyncHandler(async (req, res) => {
  const data = await service.getRoleDistribution();

  res.status(200).json({
    success: true,
    message: "Role distribution retrieved successfully",
    data,
  });
});


const getTrends = asyncHandler(async (req, res) => {
  const days = req.validated.query?.days ?? 30;
  const data = await service.getTrends(days);

  res.status(200).json({
    success: true,
    message: "Trend data retrieved successfully",
    data,
  });
});


const getEngagement = asyncHandler(async (req, res) => {
  const limit = req.validated.query?.limit ?? 10;
  const data  = await service.getEngagement(limit);

  res.status(200).json({
    success: true,
    message: "Engagement data retrieved successfully",
    data,
  });
});

module.exports = {
  getOverview,
  getTrackBreakdown,
  getRoleDistribution,
  getTrends,
  getEngagement,
};