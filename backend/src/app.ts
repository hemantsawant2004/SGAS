import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { authRouter, userRouter } from "./modules/user/user.routes";
import { env } from './config/env';
import guideRouter from "./modules/Guide/guide.route";
import AdminGuideRoutes from "./modules/Admin/ManageGuides/guide.route";
import AdminStudentRoutes from "./modules/Admin/ManageStudents/students.routes";
import StudentGuideRoutes from "./modules/Student/guides/guides.routes";
import projectRoutes from "./modules/projects/project.routes";
import notificationRoutes from "./modules/notifications/notification.routes";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);
app.options(/.*/, cors({
  origin(origin, callback) {
    if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/guides", guideRouter)
app.use("/api/admin-guides", AdminGuideRoutes);
app.use("/api/admin-students",AdminStudentRoutes);//all students to adim
app.use("/api/student-guides",StudentGuideRoutes);//all guides to admin
app.use("/api/projects", projectRoutes);//create project
app.use("/api/admin/guides", AdminGuideRoutes);//admin sets max projects limit for guide
app.use("/api/notifications", notificationRoutes);

// Error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error caught:", err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
