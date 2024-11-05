import {EsignStatus} from "../contants/enums";
import {DataTypes, Model, Optional} from "sequelize";
import OrderEsign from "./order-esign.model";
import Fish from "./fish.model";
import Package from "./package.model";
import sequelize from "../config/db";

export interface OrderEsignDetailAttributes {
    orderEsignDetailId: number,
    fishId: number
    orderEsignId: number
    quantity: number,
    orderStatus: EsignStatus
    initPrice: number;
    numberOfHealthCheck: number,
    packageId: number
}

export interface OrderEsignDetailCreationAttributes extends Optional<OrderEsignDetailAttributes, "orderEsignDetailId" | "fishId" | "initPrice" | "packageId"> {

}

class OrderEsignDetail extends Model<OrderEsignDetailAttributes, OrderEsignDetailCreationAttributes> implements OrderEsignDetailAttributes {
    public orderEsignDetailId!: number;
    public fishId!: number;
    public orderEsignId!: number;
    public quantity!: number;
    public orderStatus!: EsignStatus;
    public initPrice!: number;
    public numberOfHealthCheck!: number;
    public fish!: Fish;
    public packageId!: number;
    public packgeData!: Package;


}

OrderEsignDetail.init({
    orderEsignDetailId: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    fishId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: Fish,
            key: "fishId"
        }
    },
    orderEsignId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: OrderEsign,
            key: "orderEsignId"
        }
    }
    , quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    orderStatus: {
        type: DataTypes.ENUM(...Object.values(EsignStatus)),
        defaultValue: EsignStatus.Pending
    },
    initPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    numberOfHealthCheck: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    packageId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: Package,
            key: "packageId"
        }
    }
}, {
    sequelize, tableName: "order-esign-details", timestamps: true
});

OrderEsignDetail.belongsTo(OrderEsign, {foreignKey: "orderEsignId"});
OrderEsign.hasMany(OrderEsignDetail, {
    foreignKey: "orderEsignId", as: "orderDetails"
});

OrderEsignDetail.belongsTo(Fish, {foreignKey: "fishId", as: "fish"});
Fish.hasOne(OrderEsignDetail, {foreignKey: "fishId"});

OrderEsignDetail.belongsTo(Package, {foreignKey: "packageId", as: "packageData"});
Package.hasOne(OrderEsignDetail, {foreignKey: "packageId"});
export default OrderEsignDetail;