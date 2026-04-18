import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { env } from "../config/env";
import { UserDocument, UserModel } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

type AuthTokenPayload = JwtPayload & {
  userId: string;
};

export const authGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
      return;
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (typeof decoded === "string" || !("userId" in decoded)) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    const payload = decoded as AuthTokenPayload;
    const user = await UserModel.findById(payload.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authenticated user no longer exists",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    res.status(401).json({
      success: false,
      message,
    });
  }
};
