import { Router } from "express";
import {
    createFish,
    deleteFish,
    getAllFishes,
    getFishById,
    getFishesAvailable,
    updateFish
} from "../modules/fish/fish.controller";

const fishRoute: Router = Router();

fishRoute.get("/", getAllFishes);
fishRoute.get("/available", getFishesAvailable)
fishRoute.get("/:fishId", getFishById);
fishRoute.post("/", createFish);
fishRoute.put("/:fishId", updateFish);
fishRoute.delete("/:fishId", deleteFish);

export default fishRoute;
