import { NextFunction, Request, Response } from "express";

export function requireAuth(_req: Request, _res: Response, next: NextFunction) {
  // TODO: Add JWT/session authentication check before allowing protected routes
  next();
}
