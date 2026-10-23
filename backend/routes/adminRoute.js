import express from 'express';
import { loginAdmin, demoLoginAdmin, appointmentsAdmin, appointmentCancel, addDoctor, allDoctors, adminDashboard } from '../controllers/adminController.js';
import { changeAvailablity } from '../controllers/doctorController.js';
import authAdmin from '../middleware/authAdmin.js';
import uploadImage from '../middleware/multer.js';
import authLimiter, { demoLimiter } from '../middleware/rateLimit.js';
const adminRouter = express.Router();

adminRouter.post("/login", authLimiter, loginAdmin)
adminRouter.post("/demo-login", demoLimiter, demoLoginAdmin)
adminRouter.post("/add-doctor", authAdmin, uploadImage('image'), addDoctor)
adminRouter.get("/appointments", authAdmin, appointmentsAdmin)
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)
adminRouter.get("/all-doctors", authAdmin, allDoctors)
adminRouter.post("/change-availability", authAdmin, changeAvailablity)
adminRouter.get("/dashboard", authAdmin, adminDashboard)

export default adminRouter;