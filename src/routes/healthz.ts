import { Router } from "express";
const router = Router();

router.get("/healthz", (_req, res) => {
  res.send("ok");
});

export default router;