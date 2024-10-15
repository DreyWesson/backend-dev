import express from "express";
import { homeRouter } from "./home.js";



export default function ({homeController}) {
  const router = express.Router();

  router.use("/", homeRouter(homeController));
  // router.use("/items", itemRouter(itemController));
  // router.use('/users', userRouter(userController));
  // router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  return router;
}
