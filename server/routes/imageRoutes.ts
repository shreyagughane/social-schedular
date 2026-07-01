import express from "express";
import { generateImage } from "../controllers/imageController.js";

const imageRouter = express.Router();

imageRouter.post("/", generateImage);

export default imageRouter;