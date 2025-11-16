import jwt from "jsonwebtoken"
import User from "../models/User.js";

export const protect = async(req, res, next)=>{
 try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, token missing" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if(payload.isAdmin){
      req.user = {isAdmin: true};
      return next();
    }

    const userId = payload.id;
    
    if (!userId) return res.status(401).json({ success: false, message: "Not authorized" });

    req.user = await User.findById(userId).select("-password");

    if (!req.user) return res.status(401).json({ success: false, message: "User not found" });

    return next();

  } catch (err) {
    console.error("auth error:", err.message);
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
}

//admin role check middleware
export const checkAdmin =(req, res, next)=>{
  //req.user should already be populated by protect middleware
  if(!req.user || !req.user.isAdmin){
    return res.status(403).json({
      success: false,
      message: 'Adimn access required. Access denied'
    });
  }

  next();
};

//owner role check middleware
export const checkOwner = (req, res, next)=>{
  if(!req.user){
    return res.status(401).json({
      success: false,
      message: "Authentication Required"
    });
  }
  if(req.user.role !== 'owner'){
    return res.status(403).json({
      success: false,
      message: "Owner access required"
    });
  }
  next();
}

//Verified owner check middleware (for adding cars)
export const checkVerifiedOwner = (req, res, next)=>{
  if(!req.user){
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    })
  }

  if(req.user.role !== "owner"){
    return res.status(403).json({
      success: false,
      message: 'Owner access required'
    });
  }

  if(!req.user.isVerified){
    return res.status(403).json({
      success: false,
      message: "Your Owner account is not verified yet. Please wait for admin approval.",
      verificationStatus: req.user.verificationStatus
    });
  }
  next();
}



