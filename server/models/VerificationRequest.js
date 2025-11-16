import mongoose from "mongoose";

const {ObjectId} = mongoose.Schema.Types;

const verificationRequestSchema = new mongoose.Schema({
  userId:{
    type: ObjectId,
    ref: "User",
    required: true
  },

  requestType: {
    type: String,
    enum: ["owner_verification"],
    required: true
  }, //only owners need verification

  documents: [{
    type: String
  }],

  status:{
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  submittedAt: {
    type: Date,
    default: Date.now
  }, 

  reviewedBy:{
    type: ObjectId,
    ref: "User"
  }, //Admin who reviewed

  reviewedAt: {
    type: Date
  },

  adminNotes: {
    type: String
  }, //Admin comments
}, {timestamps: true})

//index for quick admin queries
verificationRequestSchema.index({status: 1, submiitedAt: -1});

const VerificationRequest = mongoose.model('VerificationRequest', verificationRequestSchema);

export default VerificationRequest;