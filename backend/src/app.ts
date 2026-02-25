import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter, userRouter } from "./modules/user/user.routes";
import { env } from './config/env';
import guideRouter from "./modules/Guide/guide.route";
import AdminGuideRoutes from "./modules/Admin/ManageGuides/guide.route";
import AdminStudentRoutes from "./modules/Admin/ManageStudents/students.routes";
import StudentGuideRoutes from "./modules/Student/guides/guides.routes";

const app = express();

app.use(
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'default_secret'));


app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/guides", guideRouter)
app.use("/api/admin-guides", AdminGuideRoutes);
app.use("/api/admin-students",AdminStudentRoutes);
app.use("/api/student-guides",StudentGuideRoutes)

// Error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error caught:", err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
