import { app } from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { server } from "./app.js";
dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`error connecting database : ${error} `);
  });
