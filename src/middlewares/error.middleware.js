const ApiError = require("../utils/api-error");

const PG_ERROR_MAP = {
  "23505": { status: 409, message: "A record with this value already exists" },
  "23503": { status: 409, message: "Referenced record does not exist"        },
  "23502": { status: 400, message: "A required field is missing"             },
  "22P02": { status: 400, message: "Invalid input format"                    },
};


const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};


const errorHandler = (error, req, res, next) => { // eslint-disable-line no-unused-vars
  const isProd = process.env.NODE_ENV === "production";

  // -- Postgres errors -------------------------------------------------------
  if (error.code && PG_ERROR_MAP[error.code]) {
    const mapped = PG_ERROR_MAP[error.code];
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }

  // -- Known application errors ----------------------------------------------
  if (error instanceof ApiError) {
    const payload = {
      success: false,
      message: error.message,
    };

    if (error.details) {
      payload.details = error.details;
    }

    if (!isProd && error.stack) {
      payload.stack = error.stack;
    }

    return res.status(error.statusCode).json(payload);
  }

  // -- Unexpected errors -----------------------------------------------------
  // Never leak internal details to the client in production
  console.error("[Unhandled Error]", error);

  return res.status(500).json({
    success: false,
    message: isProd ? "An unexpected error occurred" : error.message,
    ...(!isProd && { stack: error.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};