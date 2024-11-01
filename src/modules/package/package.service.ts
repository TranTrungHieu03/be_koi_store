import Package, {PackageCreationAttributes} from "../../models/package.model";
import {Transaction} from "sequelize";
import Fish from "../../models/fish.model";
import User from "../../models/user.model";
import Pool from "../../models/pool.model";

export class PackageService {
    static async getAllPackages(): Promise<Package[]> {
        try {
            return await Package.findAll({
                order: [
                    ["createdAt", "DESC"]
                ],
                include: [
                    {
                        model: Fish,
                        as: "fish",
                    },
                    {
                        model: User,
                        as: "owner"
                    }, {
                        model: Pool, as: "pool"
                    }
                ]
            });
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async getPackageByPackageId(packageId: number): Promise<Package | null> {
        try {
            return await Package.findByPk(Number(packageId));
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async create(packageData: PackageCreationAttributes, transaction?: Transaction): Promise<Package> {
        try {
            return await Package.create(packageData, {transaction});
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async update(packageId: number, packageData: PackageCreationAttributes): Promise<boolean> {
        try {
            const [updateRows] =
                await Package.update(packageData, {
                    where: {
                        packageId: Number(packageId)
                    }
                });
            return updateRows > 0;
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

}
