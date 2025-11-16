// import { model } from "mongoose";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import VerificationRequest from "../models/VerificationRequest.js";
import jwt from "jsonwebtoken";

//admin login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  //compare with env
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });
    return res.json({ success: true, token });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Invalid admin credentials" });
  }
};

//get all pending verification requests
export const getVerificationRequests = async (req, res) => {
  try {
    //find all pending verification requests
    const requests = await VerificationRequest.find({ status: "pending" })
      .populate("userId", "name email image documents")
      .sort({ submittedAt: -1 }); //newest first

    res.json({
      success: true,
      count: requests.length, //total number of pending requests
      requests,
    });
  } catch (error) {
    console.log("Error fecthing verification requests", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//approve user verification request
export const approveUserVerification = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminNotes = "" } = req.body || {}; //optional admin comments

    //Find the verification request
    const verificationRequest = await VerificationRequest.findById(requestId);

    if (!verificationRequest) {
      return res.json({
        success: false,
        messagge: "Verification request not found",
      });
    }

    //check if already processed to prevent duplicate approval
    if (verificationRequest.status !== "pending") {
      return res.json({
        success: false,
        messagge: `This request has already been ${verificationRequest.status}`,
      });
    }

    //update verification request to approved
    verificationRequest.status = "approved";
    verificationRequest.reviewedBy = req.user._id; //Admin ID from protect middleware
    verificationRequest.reviewedAt = new Date();
    verificationRequest.adminNotes = adminNotes || "";

    await verificationRequest.save();

    //upadate user to owner role and mark as verified
    await User.findByIdAndUpdate(verificationRequest.userId, {
      role: "owner", //change role from user to owner
      isVerified: true,
      verificationStatus: "approved",
      rejectionReason: "",
    });

    res.json({
      success: true,
      message: "User verified successfully and role changed to owner",
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//API to reject user verification request
export const rejectUserVerification = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason } = req.body || {};

    //rejection reason is required
    if (!rejectionReason || rejectionReason.trim() === "") {
      return res.json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const verificationRequest = await VerificationRequest.findById(requestId);

    //check if request exists
    if (!verificationRequest) {
      return res.json({
        success: false,
        message: "Verification request not found",
      });
    }

    //check if already processed
    if (verificationRequest.status !== "pending") {
      return res.json({
        success: false,
        message: `This request has already been ${verificationRequest.status}`,
      });
    }

    //update verification request to rejected
    verificationRequest.status = "rejected";
    verificationRequest.reviewedBy = req.user._id; // Store which admin rejected it
    verificationRequest.reviewedAt = new Date(); // Record rejection timestamp
    verificationRequest.adminNotes = rejectionReason; // Store rejection reason

    await verificationRequest.save();

    //update user status but keep them as regular user
    await User.findByIdAndUpdate(verificationRequest.userId, {
      verificationStatus: "rejected",
      rejectionReason: rejectionReason,
      isVerified: false,
      role: "user",
    });

    res.json({
      success: true,
      message: "Verification request rejected",
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//Car Approval Controllers

//API to get all pending cars waiting for approval
export const getPendingCars = async (req, res) => {
  try {
    //find all cars that haven't been approved by admin yet
    const cars = await Car.find({
      $or: [
        { approvalStatus: "pending" },
        { approvalStatus: { $exists: false }, isApprovedByAdmin: false },
      ],
    })
      .populate("owner", "name email isVerified")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API to approve car listing
export const approveCar = async (req, res) => {
  try {
    const { carId } = req.params;
    const car = await Car.findById(carId);

    //check if car exists
    if (!car) {
      return res.json({
        success: false,
        message: "Car Not Found",
      });
    }

    //check if already approved to prevent duplicate approval
    if (car.isApprovedByAdmin) {
      return res.json({
        success: false,
        message: "Car is already approved",
      });
    }

    //update car to approved
    car.isApprovedByAdmin = true;
    car.approvalStatus = "approved";
    car.rejectionReason = "";
    car.isAvailable = true;
    car.approvedBy = req.user._id;
    car.approvedAt = new Date();

    await car.save();

    res.json({
      success: true,
      message: "Car approved successfully", //Car is now visible to customers
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API to reject and delete car listing
export const rejectCar = async (req, res) => {
  try {
    const { carId } = req.params;
    const { reason } = req.body; //optional rejection reason

    const car = await Car.findById(carId);

    //check if car exists
    if (!car) {
      return res.json({
        success: false,
        message: "Car not found",
      });
    }

    car.isApprovedByAdmin = false;
    car.approvalStatus = "rejected";
    car.rejectionReason = reason || "No reason provided";
    car.isAvailable = false;
    car.approvedBy = null;
    car.approvedAt = null;

    await car.save();

    res.json({
      success: true,
      message: `Car ${car.brand} ${car.model} marked as rejected`,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// ============== DASHBOARD & MANAGEMENT CONTROLLERS ==============

//API to get admin dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    //execute queries in parallel using Promise.all for better performance
    const [
      totalUsers,
      totalOwners,
      verifiedOwners,
      pendingVerifications,
      totalCars,
      approvedCars,
      pendingCars,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({
        role: "owner",
      }),
      User.countDocuments({
        role: "owner",
        isVerified: true,
      }),
      VerificationRequest.countDocuments({
        status: "pending",
      }),
      Car.countDocuments(),
      Car.countDocuments({
        isApprovedByAdmin: true,
      }),
      Car.countDocuments({
        isApprovedByAdmin: false,
      }),
      Booking.countDocuments(),
      Booking.countDocuments({
        status: "confirmed",
      }),
      Booking.countDocuments({
        status: "pending",
      }),
      Booking.countDocuments({
        status: "cancelled",
      }),
    ]);

    //organize stats into categories for frontend
    const stats = {
      users: {
        total: totalUsers,
        owners: totalOwners,
        verifiedOwners: verifiedOwners,
        regularUsers: totalUsers - totalOwners, //calculate regular users
      },

      verifications: {
        pending: pendingVerifications,
      },

      cars: {
        total: totalCars,
        approved: approvedCars,
        pending: pendingCars,
      },

      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        pending: pendingBookings,
        cancelled: cancelledBookings,
      },
    };
    res.json({ success: true, stats });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API to get all users (for admin management)
export const getAllUsers = async (req, res) => {
  try {
    //fecth all users
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API to get all bookings (for admin overview)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("owner", "name email")
      .populate("car", "brand model image pricePerDay")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
