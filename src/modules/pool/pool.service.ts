import Pool, {PoolCreationAttributes} from "../../models/pool.model";
import {PoolStatus} from "../../contants/enums";
import sequelize, {Transaction} from "sequelize";

export class PoolService {
    static async getAllPools(): Promise<Pool[]> {
        try {
            return Pool.findAll({
                order: [
                    ["createdAt", "DESC"]
                ]
            });
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async create(pool: PoolCreationAttributes): Promise<Pool> {
        try {
            return await Pool.create(pool);
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async update(poolId: number, poolData: PoolCreationAttributes): Promise<boolean> {
        try {
            const [updateRows] = await Pool.update(poolData, {
                where: {
                    poolId: Number(poolId)
                }
            });
            return updateRows > 0;
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async updatePoolAfterSoldOut(poolId: number, quantity: number, transaction?: Transaction): Promise<boolean> {
        try {
            const [updateRows] = await Pool.update({
                status: sequelize.literal(`CASE WHEN currentQuantity = ${quantity} THEN '${PoolStatus.Available}' ELSE '${PoolStatus.Inactive}' END`),
                currentQuantity: sequelize.literal(`currentQuantity - ${quantity}`)
            }, {
                where: {
                    poolId
                }, transaction
            });
            return updateRows > 0;
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }


    static async getPoolById(poolId: number): Promise<Pool | null> {
        try {
            return await Pool.findByPk(Number(poolId));
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async getPoolByCode(code: string): Promise<Pool | null> {
        try {
            return await Pool.findOne({where: {code}});
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async getOrigin(poolId: number): Promise<Pool | null> {
        try {
            return await Pool.findByPk(Number(poolId), {
                attributes: ['origin', 'type', 'status', 'maxQuantity', 'currentQuantity', 'poolId']
            });
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async delete(poolId: number): Promise<boolean> {
        try {
            const [updateRows] = await Pool.update({
                status: PoolStatus.Inactive
            }, {
                where: {
                    poolId: Number(poolId)
                }
            });
            return updateRows > 0;
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async getPoolAvailable(origin: number): Promise<Pool[]> {
        try {
            return Pool.findAll({
                order: [
                    ["createdAt", "DESC"]
                ],
                where: {
                    status: PoolStatus.Available,
                    origin
                }
            });
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }
}