import express from "express";

export const homeRouter = ({ getHome }) => {
  const router = express.Router();

  router.route("/").get(getHome);

  return router;
};
