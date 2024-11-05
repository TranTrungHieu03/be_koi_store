import {EsignStatus, OrderEsginType} from "../contants/enums";
import {DataTypes, Model, Optional} from "sequelize";
import User from "./user.model";
import sequelize from "../config/db";
import {OrderEsignDetailAttributes} from "./order-esign-detail.model";

interface OrderEsignAttributes {
    orderEsignId: number;
    status: EsignStatus;
    totalPrice: number;
    staffId: number;
    userId: number;
    receiveDate: Date;
    expiryDate: Date;
    type: OrderEsginType;
    discount: number,
    finalPrice: number
}

export interface OrderEsignFullAttributes extends OrderEsignAttributes {
    orderDetails: OrderEsignDetailAttributes[]
}

export interface OrderEsignCreationAttributes extends Optional<OrderEsignAttributes, "orderEsignId" | "totalPrice" | "staffId" | "discount" | "finalPrice"> {
}

class OrderEsign extends Model<OrderEsignAttributes, OrderEsignCreationAttributes> implements OrderEsignAttributes {
    public orderEsignId!: number;
    public status!: EsignStatus;
    public totalPrice!: number;
    public staffId!: number;
    public userId!: number;
    public receiveDate!: Date;
    public expiryDate!: Date;
    public orderDetails!: OrderEsignDetailAttributes[];
    public type!: OrderEsginType;
    public discount!: number;
    public finalPrice!: number;
}

OrderEsign.init({
    orderEsignId: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    status: {
        type: DataTypes.ENUM(...Object.values(EsignStatus)),
        allowNull: false
    },
    totalPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    staffId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: User,
            key: "userId"
        }
    },
    userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: User,
            key: "userId"
        }
    },
    receiveDate: {
        type: DataTypes.DATE,
        defaultValue: new Date()
    },
    expiryDate: {
        type: DataTypes.DATE,
        defaultValue: new Date(new Date().getDate() + 3)
    },
    type: {
        type: DataTypes.ENUM(...Object.values(OrderEsginType)),
        defaultValue: OrderEsginType.Care
    },
    discount: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    finalPrice: {
        type: DataTypes.FLOAT,
        allowNull: true
    }
}, {
    tableName: "order-esigns",
    sequelize
});

OrderEsign.belongsTo(User, {foreignKey: "userId", as: "user"});
OrderEsign.belongsTo(User, {foreignKey: "staffId", as: "staff"})
export default OrderEsign