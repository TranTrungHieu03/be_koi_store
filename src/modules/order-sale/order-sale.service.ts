import OrderSale, {OrderSaleCreateAttributes, OrderSaleFullAttributes} from "../../models/order-sale.model";
import OrderSaleDetail, {OrderSaleDetailCreationAttributes} from "../../models/order-sale-detail.model";
import {Op, Transaction} from "sequelize";
import {OrderStatus} from "../../contants/enums";
import Order from "../../models/order-sale.model";
import Voucher from "../../models/voucher.model";
import User from "../../models/user.model";

export class OrderSaleService {
    static async getAllOrderSales(): Promise<OrderSale[]> {
        try {
            return OrderSale.findAll(
                {
                    order: [
                        ["createdAt", "DESC"]
                    ],
                    include: [
                        {
                            model: Voucher,
                            as: "voucher",
                        }, {
                            model: User,
                            as: "buyer"
                        }
                    ],

                }
            );
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }

    }

    static async createOrderSale(data: OrderSaleCreateAttributes, transaction: Transaction) {
        try {
            return OrderSale.create(data, {transaction});
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }

    }

    static async createSaleDetail(data: OrderSaleDetailCreationAttributes, transaction: Transaction): Promise<OrderSaleDetail> {

        try {
            return await OrderSaleDetail.create(data, {transaction});
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async getAllOrderSalesByBuyer(buyerId: number): Promise<OrderSaleFullAttributes[]> {
        try {
            return await OrderSale.findAll({
                where: {buyerId},
                include: [
                    {
                        model: OrderSaleDetail,
                        as: "orderDetails",
                        required: true
                    }
                ]
            });

        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }

    }

    static async getAllOrderSalesByOrderId(orderSaleId: number): Promise<OrderSaleFullAttributes| null> {
        try {
            return await OrderSale.findOne({
                where: {orderSaleId},
                include: [
                    {
                        model: OrderSaleDetail,
                        as: "orderDetails",
                        required: true
                    }
                ]
            });

        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }

    }

    static async updateStatusForTotalOrderDetail(orderSaleId: number, status: OrderStatus, transaction: Transaction) {
        try {
            const [updateRows] = await OrderSaleDetail.update({
                status
            }, {
                where: {
                    orderSaleId
                }, transaction
            });
            return updateRows > 0;

        } catch (e: any) {
            new Error(e.message || "Something went wrong.");
        }
    }

    static async updateStatusForOrderSale(orderSaleId: number, status: OrderStatus, transaction: Transaction) {
        try {
            const [updateRows] = await OrderSale.update({
                status
            }, {
                where: {
                    orderSaleId
                }, transaction
            });
            return updateRows > 0;

        } catch (e: any) {
            new Error(e.message || "Something went wrong.");
        }
    }

    static async updateStatusForOnlyOrderDetail(orderSaleDetailId: number, orderSaleId: number, status: OrderStatus, transaction?: Transaction) {
        try {
            const [updateRows] = await OrderSaleDetail.update({
                status
            }, {
                where: {
                    orderSaleDetailId
                },
                transaction
            });

            const orderDetails = await OrderSaleDetail.findAll({
                where: {orderSaleId},
                attributes: ['status', 'orderSaleId']
            })

            const isSameStatus = orderDetails.every(o => o.status === status)

            if (isSameStatus) {
                await OrderSale.update(
                    {status},
                    {
                        where: {orderSaleId},
                        transaction
                    }
                );
            }
            return updateRows > 0;
        } catch
            (e: any) {
            new Error(e.message || "Something went wrong.");
        }
    }

    static async cancelOrder() {
        const oneHourAgo = new Date(Date.now() - 15 * 60 * 1000);

        try {

            const [affectedRows] = await OrderSale.update(
                {status: OrderStatus.Cancel},
                {
                    where: {
                        status: 'processing',
                        createdAt: {
                            [Op.lte]: oneHourAgo,
                        },
                    },
                }
            );

            if (affectedRows > 0) {
                console.log(`${affectedRows} is canceled.`);
            }
        } catch
            (e: any) {
            new Error(e.message || "Something went wrong.");
        }
    }
}
