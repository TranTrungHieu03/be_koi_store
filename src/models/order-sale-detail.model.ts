import {DataTypes, Model, Optional} from "sequelize";
import sequelize from "../config/db";
import Fish from "./fish.model";
import OrderSale from "./order-sale.model";
import Package from "./package.model";
import {OrderStatus} from "../contants/enums";


export interface OrderSaleDetailAttributes {
    orderSaleDetailId: number;
    orderSaleId: number;
    quantity: number;
    fishId: number;
    packageId: number
    initPrice: number
    status: OrderStatus;
}

export interface OrderSaleDetailCreationAttributes extends Optional<OrderSaleDetailAttributes, "orderSaleDetailId" | "packageId" | "fishId"> {
}

class OrderSaleDetail
    extends Model<OrderSaleDetailAttributes, OrderSaleDetailCreationAttributes>
    implements OrderSaleDetailAttributes {
    public orderSaleDetailId!: number;
    public orderSaleId!: number;
    public quantity!: number;
    public fishId!: number;
    public initPrice!: number
    public packageId!: number
    public status!: OrderStatus
}

OrderSaleDetail.init(
    {
        orderSaleDetailId: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        fishId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: {
                model: Fish,
                key: "fishId",
            },
        },
        packageId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: {
                model: Package,
                key: "packageId",
            },
        },
        orderSaleId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: OrderSale,
                key: "orderSaleId"
            }
        },
        status: {
            type: DataTypes.ENUM(...Object.values(OrderStatus)),
            defaultValue: OrderStatus.Processing,
        },
        initPrice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: "order-sale-details",
        sequelize,
    }
);
// OrderSaleDetail -> OrderSale
OrderSale.hasMany(OrderSaleDetail, { foreignKey: "orderSaleId", as: "orderDetails" });
OrderSaleDetail.belongsTo(OrderSale, { foreignKey: "orderSaleId" });

// OrderSaleDetail -> Fish
OrderSaleDetail.belongsTo(Fish, { foreignKey: "fishId", as: "fish" });
Fish.hasOne(OrderSaleDetail, { foreignKey: "fishId" });

// OrderSaleDetail -> Package
OrderSaleDetail.belongsTo(Package, { foreignKey: "packageId", as: "package" });
Package.hasOne(OrderSaleDetail, { foreignKey: "packageId" });

export default OrderSaleDetail;
