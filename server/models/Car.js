import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const carSchema = new mongoose.Schema(
  {
    owner: { type: ObjectId, ref: "User" },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    image: { type: String, required: true },
    year: { type: Number, required: true },
    category: { type: String, required: true },
    seating_capacity: { type: Number, required: true },
    fuel_type: { type: String, required: true },
    transmission: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    ownershipDocumentUrl: { type: String, required: true },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },
    isAvailable: { type: Boolean, default: false },

    isApprovedByAdmin: {
      type: Boolean,
      default: false,
    },

    approvedBy: {
      type: ObjectId,
      ref: "User",
    },

    approvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

//index to speed up car lookups by owner
carSchema.index({ owner: 1 });

//index for filtering approvd cars
carSchema.index({ isApprovedByAdmin: 1, isAvailable: 1 });
carSchema.index({ approvalStatus: 1 });

const Car = mongoose.models.Car || mongoose.model("Car", carSchema);

export default Car;
