import Fish, {FishCreationAttributes} from "../../models/fish.model";
import {FishStatus, Status} from "../../contants/enums";
import {PackageCreationAttributes} from "../../models/package.model";
import sequelize, {Transaction} from "sequelize";

export class FishService {
    static async getAllFishes(): Promise<Fish[]> {
        try {
            return Fish.findAll({
                order: [
                    ["createdAt", "DESC"]
                ]
            });
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async getFishByFishId(fishId: number): Promise<Fish | null> {
        try {
            return Fish.findByPk(Number(fishId));
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async getQuantityOfPoolId(poolId: number): Promise<number> {
        try {
            return await Fish.sum('remainQuantity', {
                where: {
                    poolId
                }
            }) ?? 0
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async createFish(fish: FishCreationAttributes, transaction?: Transaction): Promise<Fish> {
        try {
            return await Fish.create(fish, {transaction});
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async deleteFish(fishId: number): Promise<boolean> {
        try {
            const [updateRows] = await Fish.update({
                status: Status.Inactive
            }, {
                where: {
                    fishId: Number(fishId)
                }
            });
            return updateRows > 0;
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async updateStatus(fishId: number, status: Status, transaction: Transaction): Promise<boolean> {
        try {
            if (status !== Status.DoneCare){
                const [updateRows] = await Fish.update({
                    status
                }, {
                    where: {
                        fishId: fishId
                    }, transaction
                });
                return updateRows > 0;
            }else {
                const [updateRows] = await Fish.update({
                    status,
                    remainQuantity: sequelize.literal(`remainQuantity - 1`),
                }, {
                    where: {
                        fishId: fishId
                    }, transaction
                });
                return updateRows > 0;
            }


        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async updateStatusAndQuantity(fishId: number, quantity: number, status: Status, transaction: Transaction): Promise<boolean> {
        try {
            const [updateRows] = await Fish.update({
                remainQuantity: sequelize.literal(`remainQuantity - ${quantity}`),
                soldQuantity: sequelize.literal(`soldQuantity + ${quantity}`),
                status,
            }, {
                where: {
                    fishId: fishId
                }, transaction
            });
            return updateRows > 0;
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async update(fishId: number, fishData: FishCreationAttributes, transaction?: Transaction): Promise<boolean> {
        try {
            const [updateRows] = await Fish.update(fishData, {
                where: {
                    fishId: Number(fishId)
                }, transaction
            });
            return updateRows > 0;
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }


    static async getPrice(fishId: number): Promise<Fish | null> {
        try {
            return await Fish.findByPk(Number(fishId), {
                attributes: ['price', 'unique', 'status', 'name', 'poolId']
            });
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async getStatus(fishId: number): Promise<Fish | null> {
        try {
            return await Fish.findByPk(fishId, {
                attributes: ['status']
            });
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async getPackage(fishId: number): Promise<Fish | null> {
        try {
            return Fish.findByPk(Number(fishId), {
                attributes: ['price', 'unique', 'status', 'name', 'poolId', 'remainQuantity']
            });
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async updateFish(fishId: number, data: FishCreationAttributes, transaction?:Transaction): Promise<boolean> {
        try {
            const [updateRows] = await Fish.update(data, {where: {fishId},transaction});
            return updateRows > 0
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

}
