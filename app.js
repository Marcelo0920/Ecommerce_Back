import express from "express";
import { config } from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

/* IMPORTING ROUTERS */
import user from "./routes/user.js";
import product from "./routes/product.js";
import order from "./routes/order.js";

config({
  path: "./data/config.env",
});

export const app = express();

//using Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: [process.env.FRONT_URI_1, process.env.FRONT_URI_2],
  })
);

app.use("/api/v1/user", user);
app.use("/api/v1/product", product);
app.use("/api/v1/order", order);
//app.use("/api/v1/category", category);

// Using Error Middleware
app.use(errorMiddleware);
