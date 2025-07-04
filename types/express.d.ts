import "express-session";

declare global {
  namespace Express {
    interface Request {
      session: {
        userId?: string;
        isAdmin?: boolean;
        [key: string]: any;
      };
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
    isAdmin?: boolean;
  }
}