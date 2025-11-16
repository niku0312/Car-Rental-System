import express from "express";
import { protect } from "../middleware/auth.js";
import { getVerificationStatus, requestOwnerVerification } from "../controllers/verificationController.js";
import upload from "../middleware/multer.js"

const verificationRouter = express.Router();

//user submits request to become owner
verificationRouter.post("/request-owner", protect, upload.array("documents", 5), requestOwnerVerification);

//check current user's verification status
verificationRouter.get("/status", protect, getVerificationStatus);

export default verificationRouter;