import rateLimit from "express-rate-limit";

// Limits login/register attempts per IP to slow down password guessing
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
});

// Demo logins need no password, so they get a looser limit: several people on
// one office network (e.g. an interview panel) shouldn't lock each other out
const demoLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message: "Too many demo sessions. Please try again in a few minutes." },
});

export { demoLimiter };
export default authLimiter;
