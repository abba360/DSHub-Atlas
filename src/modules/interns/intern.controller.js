const asyncHandler = require("../../utils/async-handler");
const ApiError     = require("../../utils/api-error");
const service      = require("./intern.service");

const createIntern = asyncHandler(async (req, res) => {
  const intern = await service.createIntern(req.validated.body);

  res.status(201).json({
    success: true,
    message: "Intern created successfully",
    data:    intern,
  });
});


const getAllInterns = asyncHandler(async (req, res) => {
  const { track, isActive } = req.validated.query ?? {};
  const interns = await service.getAllInterns({ track, isActive });

  res.status(200).json({
    success: true,
    message: "Interns retrieved successfully",
    data:    interns,
  });
});


// GET /api/v1/interns/:id
// ---------------------------------------------------------------------------
const getInternById = asyncHandler(async (req, res) => {
  const intern = await service.getInternById(req.validated.params.id);

  if (!intern) {
    throw new ApiError(404, "Intern not found");
  }

  res.status(200).json({
    success: true,
    message: "Intern retrieved successfully",
    data:    intern,
  });
});


const updateIntern = asyncHandler(async (req, res) => {
  const intern = await service.updateIntern(
    req.validated.params.id,
    req.validated.body
  );

  if (!intern) {
    throw new ApiError(404, "Intern not found");
  }

  res.status(200).json({
    success: true,
    message: "Intern updated successfully",
    data:    intern,
  });
});


const deleteIntern = asyncHandler(async (req, res) => {
  const deleted = await service.deleteIntern(req.validated.params.id);

  if (!deleted) {
    throw new ApiError(404, "Intern not found");
  }

  res.status(200).json({
    success: true,
    message: "Intern deleted successfully",
  });
});

module.exports = {
  createIntern,
  getAllInterns,
  getInternById,
  updateIntern,
  deleteIntern,
};