import rateLimit from "express-rate-limit";

// Limits login/register attempts per IP to slow down password guessing
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
});

export default authLimiter;
