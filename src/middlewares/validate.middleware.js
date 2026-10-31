import ApiError from "../utils/ApiError.js";

const validate = (schema) => {
  return (req, res, next) => {
    const requestData = {
      body: req.body ?? {},
      params: req.params ?? {},
      query: req.query ?? {},
    };

    const result = schema.safeParse(requestData);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return next(new ApiError(400, "Request validation failed", errors));
    }

    // Store validated and sanitized request data
    req.validated = result.data;

    next();
  };
};

export default validate;
