import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("Admin already exists.");
      mongoose.disconnect();
      return;
    }

    const adminUsername = "admin";
    const adminPassword = "Admin@123";

    const newAdmin = new User({
      username: adminUsername,
      password: adminPassword,
      role: "admin",
      fullName: "Default Admin",
      email: "admin@example.com",
      phone: "123-456-7890",
      isApproved: true,
    });

    await newAdmin.save();
    console.log("Admin created successfully.");

    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding admin:", error);
    mongoose.disconnect();
  }
};

seedAdmin();
