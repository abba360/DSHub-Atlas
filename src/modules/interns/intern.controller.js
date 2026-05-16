const service = require("./intern.service");
const ApiError = require("../../utils/api-error");

// CREATE
const createIntern = async (req, res, next) => {
  try {
    const data = await service.createIntern(req.body);

    return res.status(201).json({
      success: true,
      message: "Intern created successfully",
      data,
    });
  } catch (err) {
    if (err.code === "23505") {
      return next(new ApiError(409, "Email already exists"));
    }
    return next(new ApiError(500, err.message));
  }
};

// GET ALL
const getAllInterns = async (req, res, next) => {
  try {
    const data = await service.getAllInterns();

    return res.json({
      success: true,
      message: "Interns fetched successfully",
      data,
    });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

// GET ONE
const getInternById = async (req, res, next) => {
  try {
    const data = await service.getInternById(req.params.id);

    if (!data) {
      return next(new ApiError(404, "Intern not found"));
    }

    return res.json({
      success: true,
      message: "Intern fetched successfully",
      data,
    });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

// UPDATE
const updateIntern = async (req, res, next) => {
  try {
    const data = await service.updateIntern(req.params.id, req.body);

    if (!data) {
      return next(new ApiError(404, "Intern not found"));
    }

    return res.json({
      success: true,
      message: "Intern updated successfully",
      data,
    });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

// DELETE
const deleteIntern = async (req, res, next) => {
  try {
    await service.deleteIntern(req.params.id);

    return res.json({
      success: true,
      message: "Intern deleted successfully",
    });
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

module.exports = {
  createIntern,
  getAllInterns,
  getInternById,
  updateIntern,
  deleteIntern,
};