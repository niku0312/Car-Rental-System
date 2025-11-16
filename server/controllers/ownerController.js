import imagekit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs";

// API to change Role of User
export const changeRoleToOwner = async (req, res) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { role: "owner" });
    res.json({ success: true, message: "Now proceed for admin approval" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: true, message: error.message });
  }
};

// API to list car
export const addCar = async (req, res) => {
  try {
    const { _id } = req.user;

    let car = JSON.parse(req.body.carData);

    const files = req.files || {};
    const imageFile = files.image?.[0];
    const documentFile = files.document?.[0];

    if (!imageFile || !documentFile) {
      return res.json({
        success: false,
        message: "Car photo and ownership document are required.",
      });
    }

    //upload image to imagekit
    const imageBuffer = fs.createReadStream(imageFile.path);
    const uploadedImage = await imagekit.files.upload({
      file: imageBuffer,
      fileName: imageFile.originalname,
      folder: "/cars",
    });

    fs.unlink(imageFile.path, () => {});

    //optimise through imagekit URL transformation
    const optimizedImageUrl = imagekit.helper.buildSrc({
      src: uploadedImage.filePath,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      transformation: [
        { width: "1280" }, // width resizing
        { quality: "auto" }, //auto compression
        { format: "webp" }, //convert to modern format
      ],
    });

    //upload ownership document
    const documentBuffer = fs.createReadStream(documentFile.path);
    const uploadedDocument = await imagekit.files.upload({
      file: documentBuffer,
      fileName: documentFile.originalname,
      folder: "/car-documents",
    });

    fs.unlink(documentFile.path, () => {});

    const createdCar = await Car.create({
      ...car,
      owner: _id,
      image: optimizedImageUrl,
      ownershipDocumentUrl: uploadedDocument.url,
      approvalStatus: "pending",
      rejectionReason: "",
      isAvailable: false,
    });

    res.json({
      success: true,
      message: "Car submitted for admin review",
      newCar: createdCar,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// api to list owner cars
export const getOwnerCars = async (req, res) => {
  try {
    const { _id } = req.user;
    const cars = await Car.find({ owner: _id }).sort({ createdAt: -1 });
    res.json({ success: true, cars });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API to toggle car availability
export const toggleCarAvailibility = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    const car = await Car.findById(carId);

    if (!car) {
      return res.json({ success: false, message: "Car not found" });
    }

    // checking if car belongs to the user
    if (car.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const approved = car.approvalStatus
      ? car.approvalStatus === "approved"
      : car.isApprovedByAdmin;

    if (!approved) {
      return res.json({
        success: false,
        message: "Car must be approved by admin before changing availability.",
      });
    }

    car.isAvailable = !car.isAvailable;
    await car.save();

    res.json({
      success: true,
      message: car.isAvailable
        ? "Car is now live and bookable"
        : "Car hidden from renters",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API to delete a car
export const deleteCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    const car = await Car.findById(carId);

    if (!car) {
      return res.json({ success: false, message: "Car not found" });
    }

    //checking if car belongs to the user
    if (car.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    car.owner = null;
    car.isAvailable = false;
    car.isApprovedByAdmin = false;
    if (car.approvalStatus) {
      car.approvalStatus = "rejected";
    }
    car.rejectionReason = "";

    await car.save();

    res.json({ success: true, message: "Car Removed" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API to get Dashboard data //enable parallel running of the functions
export const getDashboardData = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role != "owner") {
      return res.json({ success: false, message: "Unauthorized" });
    }

    //execute all queries in parallel using Promise.all
    const [cars, bookings] = await Promise.all([
      Car.find({ owner: _id }).select("_id").lean(), //only fetch _id for count
      Booking.find({ owner: _id })
        .sort({ createdAt: -1 })
        .populate("car")
        .lean(),
    ]);

    //calculate everything from the single bookings array in memory
    let pendingCount = 0;
    let confirmedCount = 0;
    let monthlyRevenue = 0;

    for (const booking of bookings) {
      if (booking.status === "pending") pendingCount++;
      if (booking.status === "confirmed") {
        confirmedCount++;
        monthlyRevenue += booking.price;
      }
    }

    const dashboardData = {
      totalCars: cars.length,
      totalBookings: bookings.length,
      pendingBookings: pendingCount,
      completedBookings: confirmedCount,
      recentBookings: bookings.slice(0, 3),
      monthlyRevenue,
    };

    res.json({ success: true, dashboardData });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API to update user image
export const updateUserImage = async (req, res) => {
  try {
    const { _id } = req.user;

    const imageFile = req.file;

    //upload image to imagekit
    const fileBuffer = fs.createReadStream(imageFile.path);
    const response = await imagekit.files.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/users",
    });

    //optimise through imagekit URL transformation
    var optimizedImageUrl = imagekit.helper.buildSrc({
      src: response.filePath,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      transformation: [
        { width: "400" }, // width resizing
        { quality: "auto" }, //auto compression
        { format: "webp" }, //convert to modern format
      ],
    });

    const image = optimizedImageUrl;

    await User.findByIdAndUpdate(_id, { image });
    res.json({ success: true, message: "Image Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
