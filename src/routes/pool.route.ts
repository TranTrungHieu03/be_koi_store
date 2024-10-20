import { Router } from "express";
import {createPool, deletePool, getAllPools, getPoolsAvailable, updatePool} from "../modules/pool/pool.controller";

const poolRoute: Router = Router();

poolRoute.get("/", getAllPools);
poolRoute.post("/", createPool);
poolRoute.put("/:poolId", updatePool);
poolRoute.delete("/:poolId", deletePool);
poolRoute.get("/available/:originId", getPoolsAvailable)

export default poolRoute;
