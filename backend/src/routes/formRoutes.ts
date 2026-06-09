import { Router, Request, Response } from "express";

const router = Router();

router.post("/submit", (_req: Request, res: Response) => {
  // TODO: Add placeholder form submission handling
  res.json({ message: "Form submission received" });
});

export default router;
