import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";
import Pool from "./pool.model";
import { Status, Type } from "../contants/enums";
import FishType from "./type-fish.model";
import OriginFish from "./origin-fish.model";

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
}

export interface FishCreationAttributes extends Optional<FishAttributes, "fishId"> {}

class Fish extends Model<FishAttributes, FishCreationAttributes> implements FishAttributes {
  public fishId!: number;
  public name!: string;
  public age!: number;
  public character!: string;
  public features!: string;
  public foodIntake!: string;
  public image!: string;
  public origin!: string;
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
      type: DataTypes.ENUM(...Object.values(Type)),
      defaultValue: Type.PureVietnamese,
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
      allowNull: true
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
Fish.belongsTo(User, { foreignKey: "ownerId" });
User.hasMany(Fish, { foreignKey: "ownerId" });
Fish.belongsTo(Pool, { foreignKey: "poolId" });
Pool.hasMany(Fish, {
  foreignKey: "poolId",
});
OriginFish.hasMany(Fish, { foreignKey: "origin" });
Fish.belongsTo(OriginFish, { foreignKey: "origin" });

export default Fish;
