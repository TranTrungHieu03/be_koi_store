import {DataTypes, Model, Optional} from "sequelize";
import sequelize from "../config/db";

interface FeeAttributes {
    feeId: number;
    fishType: number;
    feed: number;
    careFeed: number
    careEsign: number;
    other: number
    healthCheck: number;
}

export interface FeeCreationAttributes extends Optional<FeeAttributes, "feeId"> {
}

class Fee extends Model<FeeAttributes, FeeCreationAttributes> implements FeeAttributes {
    public feeId!: number;
    public fishType!: number;
    public feed!: number;
    public careFeed!: number;
    public careEsign!: number;
    public other!: number;
    public healthCheck!: number;
}

Fee.init(
    {
        feeId: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        fishType: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        feed: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        careEsign: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        careFeed: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        healthCheck: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        other: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: "fees",
        sequelize,
    }
);

export default Fee;
