import {NextFunction, Request, Response} from "express";
import {CreateOrderSaleRequest} from "../../dto/order-sale/order-sale.request";
import {badRequest, created, ok} from "../../utils/util";
import {OrderSaleService} from "./order-sale.service";
import User from "../../models/user.model";
import {OrderStatus, Status} from "../../contants/enums";
import {VoucherService} from "../voucher/voucher.service";
import {OrderSaleCreateAttributes} from "../../models/order-sale.model";
import {FishService} from "../fish/fish.service";
import {PackageService} from "../package/package.service";
import sequelize from "../../config/db";
import {getDiscountPackages} from "../../utils/discount-package";
import {formatDate} from "../../utils/formatDate";
import {AuthRequest} from "../../types/auth-request";
import {PoolService} from "../pool/pool.service";

export const getAllOrderSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const allOrderSales = await OrderSaleService.getAllOrderSales();
        ok(res, "Get all OrderSale", allOrderSales);
    } catch (e) {
        next(e);
    }
};

export const createOrderSale = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const t = await sequelize.transaction();
    try {
        const data = req.body as CreateOrderSaleRequest;
        const existingBuyer = await User.findOne({where: {userId: data.buyerId}});
        if (!existingBuyer) {
            badRequest(res, "User not found", data)
            return
        }


        const voucher = await VoucherService.findByCode(data.voucherCode);
        if (!voucher && data.voucherCode.trim() != '') {
            badRequest(res, "Voucher not found", data)
            return
        }
        let discountByVoucher = 0;
        if (voucher && data.voucherCode.trim() != '') {
            discountByVoucher = voucher.rate
            if (Date.now() < voucher.startDate.getTime()) {
                badRequest(res, `Voucher must be use after ${formatDate(voucher.startDate)}`, data)
                return
            }
            if (Date.now() > voucher.endDate.getTime()) {
                badRequest(res, `Voucher is expired, after ${formatDate(voucher.endDate)}`, data)
                return
            }
            if (voucher.remainQuantity === 0) {
                badRequest(res, `Voucher has been fully used`, data)
                return
            }

            await VoucherService.updateQuantity(voucher.voucherId, t)
        }


        const dataOrder: OrderSaleCreateAttributes = {
            buyerId: data.buyerId,
            voucherId: voucher?.voucherId ?? undefined,
            status: OrderStatus.Processing
        }

        let cost = 0;
        const fishList = data.fishesOrder.uniqueFishes;
        const packageList = data.fishesOrder.packageFishes;


        const newOrderSale = await OrderSaleService.createOrderSale(dataOrder, t);
        if (fishList.length > 0) {
            for (let fish of fishList) {

                const currentFish = await FishService.getPrice(fish.id);
                if ((currentFish?.status !== Status.Active && currentFish?.status !== Status.Esign) || !currentFish.unique) {
                    await t.rollback();
                    badRequest(res, `Fish ${currentFish?.name} is not available for unique sale `);
                    return
                }
                if (fish.quantity > 1){
                    await t.rollback();
                    badRequest(res, `Fish ${currentFish?.name} is uniquegit git  `);
                    return
                }
                cost += currentFish?.price;


                await OrderSaleService.createSaleDetail({
                    quantity: 1,
                    status: OrderStatus.Processing,
                    fishId: fish.id,
                    initPrice: currentFish?.price ?? 0,
                    orderSaleId: newOrderSale.orderSaleId
                }, t)

                await FishService.updateStatusAndQuantity(fish.id, fish.quantity, Status.Sold, t);

                await PoolService.updatePoolAfterSoldOut(currentFish.poolId, 1, t)
            }
        }
        if (packageList.length > 0) {
            for (let container of packageList) {

                const currentFish = await FishService.getPackage(container.id);

                if (currentFish?.unique || currentFish?.status !== Status.Active) {
                    await t.rollback();
                    badRequest(res, `Fish ${currentFish?.name} is not available for package sale `);
                    return
                }
                if (currentFish.remainQuantity < container.quantity) {
                    badRequest(res, `Fish ${currentFish?.name} is not enough ${container.quantity} in stock `);
                    return
                }
                let updateStatus = Status.Active

                if (currentFish.remainQuantity === container.quantity) {
                    updateStatus = Status.Sold
                }


                await FishService.updateStatusAndQuantity(container.id, container.quantity, updateStatus, t,)
                await PoolService.updatePoolAfterSoldOut(currentFish.poolId, container.quantity, t)
                const discount = getDiscountPackages(container.quantity)
                cost += currentFish?.price * container.quantity * discount

                const newPackage = await PackageService.create({
                    name: `Package ${container.quantity} ${currentFish?.name}`,
                    fishId: container.id,
                    quantity: container.quantity,
                    ownerId: data.buyerId,
                    poolId: currentFish?.poolId
                }, t)


                await OrderSaleService.createSaleDetail({
                    quantity: 1,
                    status: OrderStatus.Processing,
                    packageId: newPackage.packageId,
                    initPrice: currentFish?.price * container.quantity * discount,
                    orderSaleId: newOrderSale.orderSaleId
                }, t)
            }

        }

        newOrderSale.totalPrice = cost - cost * discountByVoucher;
        await newOrderSale.save({transaction: t});
        await t.commit();
        created(res, "Created OrderSale", newOrderSale);
    } catch (e) {
        await t.rollback()
        next(e);
    }
};

export const getOrdersByUserId = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        const orders = await OrderSaleService.getAllOrderSalesByBuyer(Number(userId))

        ok(res, "Get all order buy user success", orders)


    } catch (e) {
        next(e);
    }
}

export const getOrderDetailByOrderId = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const orderSaleId = req.params.orderSaleId
        const order = await OrderSaleService.getAllOrderSalesByOrderId( Number(orderSaleId))

        ok(res, "Get all order buy user success", order)


    } catch (e) {
        next(e);
    }
}

export const updateTotalOrderSaleStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const t = await sequelize.transaction()
    try {
        const {status} = req.body;
        const orderSaleId = req.params.orderSaleId
        if (!Object.values(OrderStatus).includes(status)) {
            await t.rollback()
            badRequest(res, `Status is wrong format.Accepted values are: ${Object.values(OrderStatus).join(', ')}.`);
            return
        }

        await OrderSaleService.updateStatusForTotalOrderDetail(Number(orderSaleId), status, t);

        await OrderSaleService.updateStatusForOrderSale(Number(orderSaleId), status, t)


        await t.commit()
        ok(res, "Update status success")

    } catch (e) {
        await t.rollback()
        next(e);
    }
}

export const updateStatusOrderDetail = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const t = await sequelize.transaction()
    try {
        const orderSaleDetailId = req.params.orderSaleDetailId
        const {status, orderSaleId} = req.body;
        if (!Object.values(OrderStatus).includes(status)) {
            await t.rollback()
            badRequest(res, `Status is wrong format.Accepted values are: ${Object.values(OrderStatus).join(', ')}.`);
            return
        }

        await OrderSaleService.updateStatusForOnlyOrderDetail(Number(orderSaleDetailId), Number(orderSaleId), status)
        await t.commit()
        ok(res, "Update status success")
    } catch (e) {
        await t.rollback()
        next(e);
    }
}