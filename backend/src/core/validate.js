"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });
        if (!result.success) {
            return res.status(400).json({
                message: "Validation error",
                errors: result.error.flatten(),
            });
        }
        if (result.data.body)
            req.body = result.data.body;
        if (result.data.params)
            req.params = result.data.params;
        if (result.data.query)
            req.query = result.data.query;
        return next();
    };
};
exports.validate = validate;
