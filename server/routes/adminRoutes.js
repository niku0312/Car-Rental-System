import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getVerificationRequests,
  approveUserVerification,
  rejectUserVerification,
  getPendingCars,
  approveCar,
  rejectCar,
  getDashboardStats,
  getAllUsers,
  getAllBookings,
  adminLogin,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

export const requireAdmin = (req, res, next) => {
  console.log("req.user:", req.user);
  // console.log("req.user.role:", req.user?.role);

  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: admins only",
    });
  }
  next();
};

adminRouter.post("/login", adminLogin);

// All admin routes use: protect -> requireAdmin -> controller

//Verification routes
adminRouter.get(
  "/verification-requests",
  protect,
  requireAdmin,
  getVerificationRequests
);
adminRouter.post(
  "/verification-user/:requestId",
  protect,
  requireAdmin,
  approveUserVerification
);
adminRouter.post(
  "/reject-user/:requestId",
  protect,
  requireAdmin,
  rejectUserVerification
);

//car approval routes
adminRouter.get("/pending-cars", protect, requireAdmin, getPendingCars);
adminRouter.post("/approve-car/:carId", protect, requireAdmin, approveCar);
adminRouter.post("/reject-car/:carId", protect, requireAdmin, rejectCar);

//Dashboard and management routes
adminRouter.get("/dashboard-stats", protect, requireAdmin, getDashboardStats);
adminRouter.get("/users", protect, requireAdmin, getAllUsers);
adminRouter.get("/bookings", protect, requireAdmin, getAllBookings);

export default adminRouter;
