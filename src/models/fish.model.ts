import {DataTypes, Model, Optional} from "sequelize";
import sequelize from "../config/db";
import {Status, Type} from "../contants/enums";
import OriginFish from "./origin-fish.model";
import Pool from "./pool.model";
import User from "./user.model";
import TypeFish from "./type-fish.model";

interface FishAttributes {
    fishId: number;
    name: string;
    image: string;
    features: string;
    tag: string;
    status: Status;
    price: number;
    type: Type;
    sex: boolean;
    origin: number;
    age: number;
    weight: number;
    character: string;
    foodIntake: string;
    screeningRate: number;
    unique: boolean;
    packageId: number;
    poolId: number;
    initQuantity: number;
    remainQuantity: number;
    soldQuantity: number;
}

export interface FishCreationAttributes extends Optional<FishAttributes, "fishId"> {
}

class Fish extends Model<FishAttributes, FishCreationAttributes> implements FishAttributes {
    public fishId!: number;
    public name!: string;
    public age!: number;
    public character!: string;
    public features!: string;
    public foodIntake!: string;
    public image!: string;
    public origin!: number;
    public packageId!: number;
    public poolId!: number;
    public price!: number;
    public screeningRate!: number;
    public sex!: boolean;
    public status!: Status;
    public tag!: string;
    public type!: Type;
    public unique!: boolean;
    public weight!: number;
    public quantity!: number;
    public initQuantity!: number;
    public remainQuantity!: number;
    public soldQuantity!: number;
}

Fish.init(
    {
        fishId: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        features: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        tag: {
            type: DataTypes.STRING(128),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(Status)),
            defaultValue: Status.Active,
        },
        price: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },
        type: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: TypeFish,
                key: "typeFishId"
            }
        },
        sex: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        origin: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: OriginFish,
                key: "originFishId",
            },
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        initQuantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        remainQuantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        soldQuantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        screeningRate: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        weight: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        packageId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        poolId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Pool,
                key: "poolId",
            },
        },
        character: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        foodIntake: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        unique: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    {
        tableName: "fishes",
        sequelize,
    }
);
Fish.belongsTo(User, {foreignKey: "ownerId"});
User.hasMany(Fish, {foreignKey: "ownerId"});

Fish.belongsTo(Pool, {foreignKey: "poolId"});
Pool.hasMany(Fish, {
    foreignKey: "poolId",
});
OriginFish.hasMany(Fish, {foreignKey: "origin"});
Fish.belongsTo(OriginFish, {foreignKey: "origin"});

TypeFish.hasMany(Fish, {foreignKey: "type"});
Fish.belongsTo(TypeFish, {foreignKey: "type"});
export default Fish;
