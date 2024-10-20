import {NextFunction, Request, Response} from "express";
import {PoolCreationAttributes} from "../../models/pool.model";
import {badRequest, created, internalServerError, ok} from "../../utils/util";
import {PoolService} from "./pool.service";

export const createPool = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body as PoolCreationAttributes;
        if (
            data.name == null ||
            data.code == null ||
            data.type == null ||
            data.description == null ||
            data.origin == null
        ) {
            badRequest(res, "Please enter all required fields!");
            return;
        }

        const existingPool = await PoolService.getPoolByCode(data.code);
        if (existingPool) {
            badRequest(res, "Code is existed")
            return
        }
        const pool = await PoolService.create(data);
        created(res, "Create OK!", pool);
    } catch (error) {
        next(error);
    }
};

export const getAllPools = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pools = await PoolService.getAllPools();
        ok(res, "Get all pools", pools);
    } catch (error) {
        next(error);
    }
};
export const updatePool = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const poolId = req.params.poolId;
        const poolData = req.body;

        const currentPool = await PoolService.getPoolById(Number(poolId));
        if (!currentPool) {
            badRequest(res, "Not found current pool");
            return;
        }
        const updateData: PoolCreationAttributes = {
            ...currentPool,
            ...poolData,
        };
        const isSuccess = await PoolService.update(Number(poolId), updateData);
        if (!isSuccess) {
            internalServerError(res, "Update pool failed");
            return;
        }
        ok(res, "Updated Pool");
    } catch (error) {
        next(error);
    }
};
export const deletePool = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const poolId = req.params.poolId;
        const currentPool = await PoolService.getPoolById(Number(poolId));
        if (!currentPool) {
            badRequest(res, "Not found current pool");
            return;
        }
        const isSuccess = await PoolService.delete(Number(poolId));
        if (!isSuccess) {
            internalServerError(res, "Delete pool failed");
            return;
        }
        ok(res, "Deleted pool");
    } catch (error) {
        next(error);
    }
};

export const getPoolsAvailable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pools = await PoolService.getPoolAvailable(Number(req.params.originId));
        ok(res, "Get available pools", pools);

    } catch (error) {
        next(error);
    }
}
