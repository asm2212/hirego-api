import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import adminRoutes from "./routes/adminRoutes";
import { swaggerSpec } from "./docs/swagger";
import swaggerUi from "swagger-ui-express";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/user", authRoutes);
app.use("/job",jobRoutes)
app.use(applicationRoutes);
app.use(adminRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;