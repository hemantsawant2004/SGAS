import { Router } from "express";
import { auth, checkAdmin } from "../../core/auth";
import { validate } from "../../core/validate";
import { ah } from "../../core/asyncHandler";
import { CreateUserDto, LoginDto, SignupDto } from "./user.dto";
import { createUser, login, logout, me, refresh, signup } from "./user.controller";
import { forgotPassword } from "./user.controller";

const authRouter = Router();
const userRouter = Router();


//post
authRouter.post("/signup", validate(SignupDto), ah(signup));
authRouter.post("/login", validate(LoginDto), ah(login));
authRouter.post("/logout", auth(), ah(logout));
userRouter.post("/createUser",auth(),checkAdmin,validate(CreateUserDto),ah(createUser));
authRouter.post("/refresh", ah(refresh));
authRouter.post("/forgot-password", ah(forgotPassword));



//get
authRouter.get("/me", auth(), ah(me));




export { authRouter, userRouter };
