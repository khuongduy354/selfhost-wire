import { Router } from "express";
import userRoute from "./userRoutes";
import uploadRoute from "./uploadRoute";

export const setupRoute = (app: any) => {
  app.use("/v1", userRoute);
  app.use("/v1", uploadRoute);
};
