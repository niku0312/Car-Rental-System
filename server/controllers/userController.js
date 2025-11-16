import User from "../models/User.js"
import bcrypt from "bcrypt"
import { response } from "express";
import jwt from "jsonwebtoken"
import Car from "../models/Car.js";
// import React from "react"

//generate jwt token
const generateToken = (userId) => {
  const payload = {id: userId};

  return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "10d"})
}

//Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password || password.length < 5) {
      return res.json({ success: false, message: "fill all the fields" })
    }

    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.json({ success: false, message: "User already exists" })

    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.create({ name, email, password: hashedPassword })

    // const token = generateToken(user._id.toString())

    res.json({ success: true, message: "User Created Successfully" })

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message })

  }
}

// Login User
export const loginUser = async(req, res)=>{
  try {
    const {email, password} = req.body
    const user = await User.findOne({email});

    if(!user){
      return res.json({success: false, message: "User not found"})
    }

    const isMatch = await bcrypt.compare(password, user.password) 

    if(!isMatch){
      return res.json({success: false, message: "Invalid Credentials"})
    }

    //when user and password matches
    const token = generateToken(user._id.toString())
    res.json({success: true, token});

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message })
  }
}

//get user data using token (jwt)
export const getUserData = async(req, res)=>{
  try {
    const {user} = req;
    res.json({success: true, user})
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message })
  }
}

// get all cars for the frontend
export const getCars = async(req, res)=>{
  try {
    const cars = await Car
    .find({isApprovedByAdmin: true, isAvailable: true})
    .populate('owner', 'name email')
    .sort({createdAt: -1});

    res.json({success: true, cars})
  } catch (error) {
    console.log(error.message);
    res.json({success: false, message: error.message});

  }
}