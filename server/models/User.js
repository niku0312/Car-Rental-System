import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  role: {type: String, enum: ["owner", "user"] , default: 'user'},
  image: {type: String, default: ''},

  //new fields for verification system
  isVerified: {
    type: Boolean,
    default: false
  },

  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected", "none"],
    default: "none"
  }, //track verification request status

  rejectionReason:{
    type: String
  },

  documents: [{
    type: String //URLs of uploaded verification documents
  }],

}, {timestamps: true})

const User = mongoose.model('User', userSchema)

export default User;