import VerificationRequest from "../models/VerificationRequest.js";
import fs from "fs";
import imagekit from "../configs/imageKit.js";
import User from "../models/User.js";

//API to submit owner verification request
export const requestOwnerVerification = async (req, res) => {
  try {
    const { _id } = req.user;

    //check if user already has a pending request
    const existingRequest = await VerificationRequest.findOne({
      userId: _id,
      status: "pending",
    });

    if (existingRequest) {
      return res.json({
        success: false,
        message: "You already have a pending verification request",
      });
    }

    //block re-submission for already verified owners
    if (req.user.isVerified) {
      return res.json({
        success: false,
        message: "Your owner account is already verified",
      });
    }

    //upload documents to ImageKit (if files provided)
    let documentUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileBuffer = fs.createReadStream(file.path);
        const response = await imagekit.files.upload({
          file: fileBuffer,
          fileName: file.originalname,
          folder: "/verification-documents",
        });
        documentUrls.push(response.url);
        //Delete temp file
        fs.unlinkSync(file.path);
      }
    }

    //create new verification request
    const verificationRequest = new VerificationRequest({
      userId: _id,
      requestType: "owner_verification",
      documents: documentUrls,
      status: "pending",
    });

    await verificationRequest.save();

    //update user verification status
    await User.findByIdAndUpdate(_id, {
      verificationStatus: "pending",
      documents: documentUrls,
    });

    res.json({
      success: true,
      message:
        "Verification request submitted successfully. Please wait for admin approval.",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API to check user's verification status
export const getVerificationStatus = async (req, res) => {
  try {
    const { _id } = req.user;

    const request = await VerificationRequest.findOne({ userId: _id })
      .sort({ submittedAt: -1 })
      .populate("reviewedBy", "name email");

    res.json({
      success: true,
      verificationStatus: req.user.verificationStatus,
      isVerified: req.user.isVerified,
      role: req.user.role,
      rejectionReason: req.user.rejectionReason || "",
      request: request || null,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
