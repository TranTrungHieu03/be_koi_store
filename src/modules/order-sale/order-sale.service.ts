import OrderSale, {OrderSaleCreateAttributes, OrderSaleFullAttributes} from "../../models/order-sale.model";
import OrderSaleDetail, {OrderSaleDetailCreationAttributes} from "../../models/order-sale-detail.model";
import {Op, Transaction} from "sequelize";
import {EsignStatus, OrderStatus, Status} from "../../contants/enums";
import Voucher from "../../models/voucher.model";
import User from "../../models/user.model";
import Fish from "../../models/fish.model";
import Package from "../../models/package.model";
import sequelize from "../../config/db";
import {PackageService} from "../package/package.service";
import OrderEsignDetail from "../../models/order-esign-detail.model";
import OrderEsign from "../../models/order-esign.model";

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
                        required: true,
                        include: [
                            {
                                model: Fish,
                                as: 'fish',
                                required: false
                            },
                            {
                                model: Package,
                                as: "package",
                                required: false
                            }
                        ]
                    }
                ]
            });

        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }

    }

    static async getAllOrderSalesByOrderId(orderSaleId: number): Promise<OrderSaleFullAttributes | null> {
        try {
            return await OrderSale.findOne({
                where: {orderSaleId},
                include: [
                    {
                        model: OrderSaleDetail,
                        as: "orderDetails",
                        required: true,
                        include: [
                            {
                                model: Fish,
                                as: 'fish'
                            },
                            {
                                model: Package,
                                as: "package"
                            }
                        ]
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
        const t = await sequelize.transaction()
        try {
            const ordersToCancel = await OrderSale.findAll({
                where: {
                    status: 'processing',
                    createdAt: {
                        [Op.lte]: oneHourAgo,
                    },
                },
                include: [
                    {
                        model: OrderSaleDetail,
                        as: 'orderDetails',
                        required: true
                    }
                ]
            },);
            console.log(ordersToCancel)
            for (let order of ordersToCancel) {

                const orderDetails = order.orderDetails;
                for (let orderDetail of orderDetails) {
                    if (orderDetail.fishId !== null) {
                        // await OrderEsignDetail.update({orderStatus: EsignStatus.Cancel}, {
                        //     where: {
                        //         fishId: orderDetail.fishId,
                        //     }, transaction: t
                        // })
                        const orderEsignDetail = await OrderEsignDetail.findOne({
                            where: {
                                fishId: orderDetail.fishId,
                            }
                        })
                        if (!orderEsignDetail) {
                            await t.rollback();
                            return;
                        }
                        orderEsignDetail.orderStatus = EsignStatus.Cancel
                        await OrderEsign.update({
                            status: EsignStatus.Cancel
                        }, {
                            where: {
                                orderEsignId: orderEsignDetail.orderEsignId
                            }
                        })
                        await orderEsignDetail.save({transaction: t})


                        await Fish.update({
                            remainQuantity: sequelize.literal(`remainQuantity + 1`),
                            soldQuantity: sequelize.literal(`soldQuantity - 1`),
                            status: Status.Active,
                        }, {
                            where: {
                                fishId: orderDetail.fishId
                            }, transaction: t
                        });
                    } else {
                        const packageItem = await PackageService.getPackageByPackageId(orderDetail.packageId);
                        await OrderEsignDetail.update({orderStatus: EsignStatus.Cancel}, {
                            where: {
                                packageId: orderDetail.packageId,
                            }, transaction: t
                        })
                        await Fish.update({
                            remainQuantity: sequelize.literal(`remainQuantity + ${packageItem?.quantity}`),
                            soldQuantity: sequelize.literal(`soldQuantity - ${packageItem?.quantity}`),
                            status: Status.Active,
                        }, {
                            where: {
                                fishId: packageItem?.fishId
                            }, transaction: t
                        });
                        const orderEsignDetail = await OrderEsignDetail.findOne({
                            where: {
                                packageId: orderDetail.packageId,
                            }
                        })
                        if (!orderEsignDetail) {
                            await t.rollback();
                            return;
                        }
                        orderEsignDetail.orderStatus = EsignStatus.Cancel
                        await OrderEsign.update({
                            status: EsignStatus.Cancel
                        }, {
                            where: {
                                orderEsignId: orderEsignDetail.orderEsignId
                            }
                        })
                        await orderEsignDetail.save({transaction: t})

                    }
                }
            }


            const [affectedRows] = await OrderSale.update(
                {status: OrderStatus.Cancel},
                {
                    where: {
                        status: 'processing',
                        createdAt: {
                            [Op.lte]: oneHourAgo,
                        },
                    }, transaction: t
                },
            );

            if (affectedRows > 0) {
                console.log(`${affectedRows} is canceled.`);
            }
            await t.commit();
        } catch
            (e: any) {
            await t.rollback();
            new Error(e.message || "Something went wrong.");
        }
    }
}
