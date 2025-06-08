import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import adminRoutes from "./routes/adminRoutes";
import { swaggerSpec } from "./docs/swagger";
import swaggerUi from "swagger-ui-express";
import { authenticateUser } from "./middlewares/authenticateUser";
import { authorizeAdmin } from "./middlewares/authorizeAdmin";
import favoriteRoutes from "./routes/favoriteRoutes";
import healthzRouter from './routes/healthz'

const app = express();
app.use(cors());
app.use(express.json());
app.use("/user", authRoutes);
app.use("/job",jobRoutes)
app.use(applicationRoutes);
// ✅ Admin-only middleware only on admin routes
app.use("/admin", authenticateUser, authorizeAdmin, adminRoutes);

// ✅ Do NOT apply `authorizeAdmin` globally
app.use(favoriteRoutes); // Candidate-protected internally
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(healthzRouter);


export default app;