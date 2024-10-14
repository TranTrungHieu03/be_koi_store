import {DataTypes, Model, Optional} from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";
import {OrderStatus} from "../contants/enums";
import Voucher from "./voucher.model";
import OrderSaleDetail, {OrderSaleDetailAttributes} from "./order-sale-detail.model";

interface OrderSaleAttributes {
    orderSaleId: number;
    totalPrice: number;
    voucherId: number;
    buyerId: number;
    status: OrderStatus
}

export interface OrderSaleCreateAttributes
    extends Optional<OrderSaleAttributes, "orderSaleId" | "voucherId" | "totalPrice"> {
}

export interface OrderSaleFullAttributes extends OrderSaleAttributes {
    orderDetails: OrderSaleDetailAttributes[]
}

class OrderSale extends Model<OrderSaleAttributes, OrderSaleCreateAttributes> implements OrderSaleAttributes {
    public orderSaleId!: number;
    public totalPrice!: number;
    public voucherId!: number;
    public buyerId!: number;
    public status!: OrderStatus;
    public orderDetails!: OrderSaleDetailAttributes[];
}

OrderSale.init(
    {
        orderSaleId: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        totalPrice: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        voucherId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: {
                model: Voucher,
                key: "voucherId",
            },
        },
        buyerId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: User,
                key: "userId",
            },
        },
        status: {
            type: DataTypes.ENUM(...Object.values(OrderStatus)),
            defaultValue: OrderStatus.Processing
        }
    },
    {
        tableName: "order-sales",
        sequelize,
    }
);

OrderSale.belongsTo(User, {foreignKey: "buyerId"});
User.hasMany(OrderSale, {
    foreignKey: "buyerId",
});
OrderSale.hasOne(Voucher, {foreignKey: "voucherId"})

export default OrderSale;
