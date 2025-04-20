import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./App/routes";
import globalErrorHandler from "./App/middlewares/globalErrorhandler";
import notFound from "./App/middlewares/notFound";

const app: Application = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    // origin: "https://house-rent-client.onrender.com",
    origin: "https://house-finder-rakibul.vercel.app/",
    // origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/", router);

app.use(globalErrorHandler);

app.use(notFound as any);

export default app;
