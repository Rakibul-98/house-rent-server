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
    origin: "https://bike-solution-rakibul.vercel.app",
    // origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/", router);

app.use(globalErrorHandler);

app.use(notFound as any);

export default app;
