"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
function requireRole(roles) {
    return (req, res, next) => {
        const role = req.user?.role;
        console.log("inside check role", role);
        if (!role || !roles.includes(role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        return next();
    };
}
