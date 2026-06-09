import { Router, Request, Response } from "express";

const router = Router();

router.post("/signin", (_req: Request, res: Response) => {
  // TODO: Add placeholder sign-in flow or validation logic
  res.json({ message: "Sign-in endpoint placeholder" });
});

router.post("/signout", (_req: Request, res: Response) => {
  // TODO: Add placeholder sign-out flow or token invalidation
  res.json({ message: "Sign-out endpoint placeholder" });
});

export default router;
