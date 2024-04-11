import { app } from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`This server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`error connecting database : ${error} `);
  });
