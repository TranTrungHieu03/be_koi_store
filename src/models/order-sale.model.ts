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
    status: OrderStatus;
    createdAt: Date;

}

export interface OrderSaleCreateAttributes
    extends Optional<OrderSaleAttributes, "orderSaleId" | "voucherId" | "totalPrice"|"createdAt"> {
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
    public createdAt!: Date;

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
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },

    },
    {
        tableName: "order-sales",
        sequelize,
        timestamps: true
    }
);

OrderSale.belongsTo(User, {foreignKey: "buyerId", as: "buyer"});
User.hasMany(OrderSale, {
    foreignKey: "buyerId"
});
OrderSale.hasOne(Voucher, {foreignKey: "voucherId", as: "voucher"})

export default OrderSale;
