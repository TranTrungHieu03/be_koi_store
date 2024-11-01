import {DataTypes, Model, Optional} from "sequelize";
import sequelize from "../config/db";
import Fish from "./fish.model";
import Pool from "./pool.model";
import User from "./user.model";

interface PackageAttributes {
    name: string;
    packageId: number;
    quantity: number;
    ownerId: number;
    poolId: number;
    fishId: number;
}

export interface PackageCreationAttributes extends Optional<PackageAttributes, "packageId" | "poolId"> {
}

class Package extends Model<PackageAttributes, PackageCreationAttributes> implements PackageAttributes {
    public name!: string;
    public packageId!: number;
    public quantity!: number;
    public ownerId!: number;
    public poolId!: number;
    public fishId!: number
}

Package.init(
    {
        packageId: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        ownerId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: User,
                key: "userId",
            },
        },
        poolId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: {
                model: Pool,
                key: "poolId",
            },
        },
        fishId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: {
                model: Fish,
                key: "fishId",
            },
        },
    },
    {
        tableName: "packages",
        sequelize,
    }
);
Package.hasOne(Fish, {foreignKey: "fishId", as: "fish"});
Package.belongsTo(User, {
    foreignKey: "ownerId", as: "owner"
});
Package.belongsTo(Pool, {foreignKey: "poolId", as: "pool"});

Package.belongsTo(Fish, {foreignKey: "fishId"})
export default Package;
