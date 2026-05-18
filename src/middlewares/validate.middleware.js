const ApiError = require("../utils/api-error");

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body:   req.body,
    params: req.params,
    query:  req.query,
  });

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field:   issue.path.join("."),
      message: issue.message,
    }));

    return next(new ApiError(400, "Validation failed", details));
  }

  // Attach parsed data — downstream always reads from req.validated
  req.validated = result.data;

  return next();
};

module.exports = validate;