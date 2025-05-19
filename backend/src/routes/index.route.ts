import { Router } from "express";
import userRoute from "./userRoutes";
import uploadRoute from "./uploadRoute";

const router = Router();
export const setupRoute = (app: any) => {
  router.use("/v1", userRoute);
  router.use("/v1", uploadRoute);
};
