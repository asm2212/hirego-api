import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import applicationRoutes from "./routes/applicationRoutes";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/user", authRoutes);
app.use("/job",jobRoutes)
app.use(applicationRoutes);

export default app;