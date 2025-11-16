import express from "express";
import { protect } from "../middleware/auth.js";
import {
  addCar,
  changeRoleToOwner,
  deleteCar,
  getDashboardData,
  getOwnerCars,
  toggleCarAvailibility,
  updateUserImage,
} from "../controllers/ownerController.js";
import upload from "../middleware/multer.js";

const ownerRouter = express.Router();

//middleware to check if user is owner
export const requireOwner = (req, res, next) => {
  console.log("req.user:", req.user);
  console.log("req.user.role:", req.user?.role);
  if (!req.user || req.user.role !== "owner") {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden: owners only" });
  }
  next();
};

//middleware to check if owner is verified
export const requireVerifiedOwner = (req, res, next) => {
  console.log("req.user:", req.user);
  console.log("req.user.isVerified:", req.user?.isVerified);

  if (!req.user || req.user.role !== "owner") {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden: owners only" });
  }

  if (!req.user.isVerified) {
    return res.json({
      success: false,
      message:
        "Your owner account is not verified yet. Please wait for admin approval.",
      verificationStatus: req.user.verificationStatus,
    });
  }
  next();
};

//allow any authenticated user to request role change
ownerRouter.post("/change-role", protect, changeRoleToOwner);

//owner-only routes: protect -> requireOwner -> controller
//only verified owners can add cars
ownerRouter.post(
  "/add-car",
  protect,
  requireVerifiedOwner,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  addCar
); //protect works a security guard

//thses routes only need owner role(no verification needed)
ownerRouter.get("/cars", protect, requireOwner, getOwnerCars);

ownerRouter.post("/toggle-car", protect, requireOwner, toggleCarAvailibility);

ownerRouter.post("/delete-car", protect, requireOwner, deleteCar);

ownerRouter.get("/dashboard", protect, requireOwner, getDashboardData);

ownerRouter.post(
  "/update-image",
  upload.single("image"),
  protect,
  requireOwner,
  updateUserImage
);

export default ownerRouter;
