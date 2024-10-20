import {DataTypes, Model, Optional} from "sequelize";
import sequelize from "../config/db";
import {PoolStatus, PoolType} from "../contants/enums";
import OriginFish from "./origin-fish.model";

interface PoolAttributes {
    poolId: number;
    maxQuantity: number;
    code: string;
    name: string;
    description: string;
    type: PoolType;
    origin: number;
    status: PoolStatus;
    currentQuantity: number;
}

export interface PoolCreationAttributes extends Optional<PoolAttributes, "poolId"> {
}

class Pool extends Model<PoolAttributes, PoolCreationAttributes> implements PoolAttributes {
    public poolId!: number;
    public name!: string;
    public description!: string;
    public type!: PoolType;
    public origin!: number;
    public maxQuantity!: number;
    public currentQuantity!: number;
    public code!: string;
    public status!: PoolStatus;
}

Pool.init(
    {
        poolId: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        type: {
            type: DataTypes.ENUM(...Object.values(PoolType)),
            allowNull: false,
        },

        origin: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: OriginFish,
                key: "originFishId",
            },
        },

        maxQuantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(PoolStatus)),
            defaultValue: PoolStatus.Available,
        },
        currentQuantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    },
    {
        tableName: "pools",
        sequelize,
    }
);

OriginFish.hasMany(Pool, {foreignKey: "origin"});
Pool.belongsTo(OriginFish, {foreignKey: "origin"});

export default Pool;
