import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import connectDB from "./index.js";

dotenv.config();

connectDB().then(async () => {
  await seedAdmin();
  process.exit(1);
});

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("Admin already exists.");
      return;
    }

    const adminUsername = "admin";
    const adminPassword = "Admin@123";
    const newAdminData = {
      username: adminUsername,
      password: adminPassword,
      role: "admin",
      fullName: "Default Admin",
      email: "admin@example.com",
      phone: "123-456-7890",
    };

    const newAdmin = await User.create(newAdminData);

    console.log("Admin created successfully:", newAdmin);
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
};
