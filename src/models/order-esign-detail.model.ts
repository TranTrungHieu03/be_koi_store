import {FishStatus, EsignStatus} from "../contants/enums";
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
    numberOfHealthCheck: number
}

export interface OrderEsignDetailCreationAttributes extends Optional<OrderEsignDetailAttributes, "orderEsignDetailId" | "fishId" | "initPrice"> {

}

class OrderEsignDetail extends Model<OrderEsignDetailAttributes, OrderEsignDetailCreationAttributes> implements OrderEsignDetailAttributes {
    public orderEsignDetailId!: number;
    public fishId!: number;
    public orderEsignId!: number;
    public quantity!: number;
    public orderStatus!: EsignStatus;
    public initPrice!: number;
    public numberOfHealthCheck!: number

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
    }
}, {
    sequelize, tableName: "order-esign-details"
});

OrderEsignDetail.belongsTo(OrderEsign, {foreignKey: "orderEsignId"});
OrderEsign.hasMany(OrderEsignDetail, {
    foreignKey: "orderEsignId", as: "orderDetails"
});

OrderEsignDetail.hasOne(Fish, {foreignKey: "fishId"});
Fish.belongsTo(OrderEsignDetail, {foreignKey: "fishId"});

export default OrderEsignDetail;