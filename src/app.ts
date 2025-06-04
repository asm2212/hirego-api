import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/user", authRoutes);
app.use("/job",jobRoutes)

export default app;