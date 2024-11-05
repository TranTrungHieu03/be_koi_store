import {NextFunction, Request, Response} from "express";
import {badRequest, created, ok} from "../../utils/util";
import {OrderEsignService} from "./order-esign.service";
import {EsignStatus, FishStatus, OrderEsginType, PoolStatus, Status} from "../../contants/enums";
import {OrderEsginRequestCreation} from "../../dto/order-esign/order-esign.request";
import sequelize from "../../config/db";
import User from "../../models/user.model";
import {OrderEsignCreationAttributes} from "../../models/order-esign.model";
import {FishService} from "../fish/fish.service";
import {AuthRequest} from "../../types/auth-request";
import {countDate} from "../../utils/countDate";
import {estimateTypeFish} from "../../utils/estimateTypeFish";
import {FeeService} from "../fee/fee.service";
import {getDiscountLongDuration} from "../../utils/getDiscountLongDuration";
import {PoolService} from "../pool/pool.service";
import {OrderSaleService} from "../order-sale/order-sale.service";
import {PackageService} from "../package/package.service";


export const createOrderEsign = async (req: Request, res: Response, next: NextFunction) => {
    const t = await sequelize.transaction();
    try {
        const data = req.body as OrderEsginRequestCreation;
        const existingBuyer = await User.findOne({where: {userId: data.buyerId}});
        if (!existingBuyer) {
            badRequest(res, "User not found", data)
            return
        }
        console.log(data)

        if (!data.receiveDate || !data.expireDate) {
            badRequest(res, "Receive date and expire date is required", data)
            return
        }


        const dataOrder: OrderEsignCreationAttributes = {
            userId: data.buyerId,
            status: EsignStatus.Pending,
            receiveDate: data.receiveDate,
            expiryDate: data.expireDate,
            type: data.type
        }

        const newOrderEsign = await OrderEsignService.createEsign(dataOrder, t)

        // let cost = 0;
        const fishList = data.fishes;

        if (data.type === OrderEsginType.Care) {
            if (fishList.length > 0) {
                for (let fish of fishList) {

                    if (!fish.numberOfHealthCheck) {
                        badRequest(res, "Number of health check is required", data);
                        await t.rollback()
                        return;
                    }
                    const newFish = await FishService.createFish({
                        ...fish,
                        remainQuantity: fish.initQuantity,
                        price: fish.isNeedEstimated ? -1 : fish.price,
                        unique: true,
                        status: Status.PendingCare
                    }, t);

                    await OrderEsignService.createEsignDetail({
                        fishId: newFish.fishId,
                        quantity: 1,
                        orderStatus: EsignStatus.Pending,
                        orderEsignId: newOrderEsign.orderEsignId,
                        numberOfHealthCheck: fish.numberOfHealthCheck
                    }, t)
                }
            }
        } else if (data.type === OrderEsginType.OnlineSale || data.type === OrderEsginType.OfflineSale) {
            if (fishList.length > 0) {
                for (let fish of fishList) {

                    if (!fish.numberOfHealthCheck) {
                        badRequest(res, "Number of health check is required", data);
                        await t.rollback()
                        return;
                    }
                    const newFish = await FishService.createFish({
                        ...fish,
                        remainQuantity: fish.initQuantity,
                        price: fish.isNeedEstimated ? -1 : fish.price,
                        unique: true,
                        status: Status.PendingEsign
                    }, t);

                    await OrderEsignService.createEsignDetail({
                        fishId: newFish.fishId,
                        quantity: 1,
                        orderStatus: EsignStatus.Pending,
                        orderEsignId: newOrderEsign.orderEsignId,
                        numberOfHealthCheck: fish.numberOfHealthCheck
                    }, t)
                }
            }
        }

        await t.commit()
        created(res, "Create order success!", newOrderEsign);

    } catch (e) {
        await t.rollback()
        next(e);
    }
};


export const confirmOrderEsginByCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const t = await sequelize.transaction();
    try {
        const orderEsignId = req.params.orderEsignId;
        const {orderStatus} = req.body;

        if (orderStatus == null) {
            badRequest(res, "Please choose status")
        }

        const currentOrderEsign = await OrderEsignService.getById(Number(orderEsignId));
        if (currentOrderEsign?.userId !== req.user?.userId) {
            badRequest(res, "You need use right account to confirm order");
            return;
        }

        await OrderEsignService.updateOrderEsignStatus(Number(orderEsignId), orderStatus, t)
        await OrderEsignService.updateStatusForTotalOrderEsignDetail(Number(orderEsignId), orderStatus, t)

        await t.commit()
        ok(res, "Update status success")

    } catch (e) {
        await t.rollback()
        next(e);
    }
}


export const confirmOrderEsginDetailByCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const t = await sequelize.transaction();
    try {

        const orderEsignDetailId = req.params.orderEsignDetailId;
        const {status, orderEsignId} = req.body;

        if (status == null) {
            badRequest(res, "Please choose status")
        }

        const currentOrderEsign = await OrderEsignService.getById(Number(orderEsignId));

        if (currentOrderEsign?.userId !== req.user?.userId) {
            badRequest(res, "You need use right account to confirm order");
            return;
        }

        await OrderEsignService.updateStatusForOnlyOrderEsignDetail(Number(orderEsignDetailId), Number(orderEsignId), status, t)
        await t.commit()
        ok(res, "Update status success")

    } catch (e) {
        await t.rollback()
        next(e);
    }
}
export const updateEsginDetailByStaff = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const t = await sequelize.transaction();
    try {
        const orderEsignId = req.params.orderEsignId;

        const currentOrder = await OrderEsignService.getById(Number(orderEsignId));
        if (!currentOrder) {
            badRequest(res, "Order not found")
            await t.rollback();
            return
        }
        const data = req.body as OrderEsginRequestCreation;
        const fishList = data.fishes;
        let count = countDate(data.receiveDate, data.expireDate);
        if (!data.type) {
            badRequest(res, "Type order is required")
            await t.rollback();
            return
        }
        let totalPrice = 0;

        if (fishList.length > 0) {
            for (let fish of fishList) {
                if (fish.price <= 0) {
                    badRequest(res, "Price of fish must be greater than 0")
                    await t.rollback();
                    return
                }
                if (!fish.orderEsignDetailId) {
                    badRequest(res, "Order detail id can not null")
                    await t.rollback();
                    return
                }
                if (!fish.fishId) {
                    badRequest(res, "Fish id can not null")
                    await t.rollback();
                    return
                }

                await FishService.update(Number(fish.fishId), {
                    ...fish
                }, t)

                console.log(fish)


                const typeFishOfWeight = estimateTypeFish(fish.weight)

                const getFee = await FeeService.getById(typeFishOfWeight);

                const rateHealth = fish.healthStatus == FishStatus.Sick ? 2 : 1;
                const currentOrderEsignDetail = await OrderEsignService.getOrderDetailById(fish.orderEsignDetailId!);
                if (!currentOrderEsignDetail) {
                    badRequest(res, "Order esign detail not found")
                    await t.rollback();
                    return
                }
                let initPrice = 0
                if (data.type === OrderEsginType.Care) {
                    initPrice = (getFee!.feed * count + getFee!.careFeed * count * rateHealth + getFee!.other) * 10000;
                    await OrderEsignService.updateEsignDetail(fish.orderEsignDetailId!, {
                        ...currentOrderEsignDetail,
                        orderStatus: EsignStatus.Pending,
                        initPrice: fish.price
                    }, t)

                    totalPrice += initPrice
                } else if (data.type === OrderEsginType.OnlineSale) {
                    await OrderEsignService.updateEsignDetail(fish.orderEsignDetailId!, {
                        ...currentOrderEsignDetail,
                        orderStatus: EsignStatus.Pending,
                        initPrice: fish.price * 0.1
                    }, t)

                    totalPrice += fish.price * 0.1
                } else if (data.type === OrderEsginType.OfflineSale) {
                    await OrderEsignService.updateEsignDetail(fish.orderEsignDetailId!, {
                        ...currentOrderEsignDetail,
                        orderStatus: EsignStatus.Pending,
                        initPrice: fish.price * 0.15
                    }, t)

                    totalPrice += fish.price * 0.15
                }


            }
        }


        const getDiscount = getDiscountLongDuration(count);

        if (data.type === OrderEsginType.Care) {

            await OrderEsignService.updateTotalPrice(Number(orderEsignId), Number(data.staffId), totalPrice, getDiscount, totalPrice - totalPrice * getDiscount, t);
        } else {
            await OrderEsignService.updateTotalPrice(Number(orderEsignId), Number(data.staffId), totalPrice, 0, totalPrice, t);
        }

        await t.commit();
        ok(res, "Waiting confirm from customer")


    } catch (e) {
        await t.rollback()
        next(e);
    }
}

export const updateTotalEsign = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const t = await sequelize.transaction();
    try {
        const orderEsignId = req.params.orderEsignId;


    } catch (e) {
        await t.rollback()
        next(e);
    }
}
export const getOrderEsgin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const orderEsignId = req.params.orderEsignId;
        const data = await OrderEsignService.getById(Number(orderEsignId));
        ok(res, "Get data success", data)


    } catch (e) {
        next(e);
    }
}

export const updateStatusAfterShipping = async (req: AuthRequest, res: Response, next: NextFunction) => {

    const t = await sequelize.transaction();
    try {
        const orderEsignId = req.params.orderEsignId;
        const {orderStatus, fishStatus, pools} = req.body;

        const currentOrder = await OrderEsignService.getShortById(Number(orderEsignId));
        if (!currentOrder) {
            badRequest(res, "Order not found")
            return
        }

        if (!orderStatus) {
            badRequest(res, "Status not found")
            return
        }

        await OrderEsignService.updateOrderEsignStatus(Number(orderEsignId), orderStatus, t)
        const fishList = await OrderEsignService.findAllFish(Number(orderEsignId))
        if (fishList && fishList.length > 0) {
            for (let fish of fishList) {
                const currentFish = await FishService.getFishByFishId(fish.fishId);
                if (!currentFish) {
                    badRequest(res, "Fish not found")
                    await t.rollback()
                    return
                }

                if (pools) {
                    const poolList = pools as { fishId: number, poolId: number }[]
                    const poolId = poolList.find((pool) => pool.fishId === fish.fishId);
                    console.log(poolId)
                    if (!poolId) {
                        badRequest(res, "Some fish has not pool")
                        await t.rollback()
                        return
                    }
                    const pool = await PoolService.getOrigin(poolId.poolId)
                    const typePoolNeed = currentFish.unique ? "specific" : "general"
                    if (!pool) {
                        badRequest(res, "This pool not exist")
                        return
                    }

                    if (pool.origin !== currentFish.origin || pool.type !== typePoolNeed) {
                        badRequest(res, "This currentFish cannot live in this pool")
                        return
                    }
                    if (currentFish.unique && (currentFish.initQuantity !== 1)) {
                        badRequest(res, "Specific currentFish is unique")
                        return
                    }


                    const currentQuantityOfPool = await FishService.getQuantityOfPoolId(currentFish.poolId);
                    if (currentFish.initQuantity + pool.currentQuantity > pool.maxQuantity) {
                        badRequest(res, "Too much currentFishes in this pool", currentFish);
                        return
                    }
                    if (!currentFish.unique || pool.maxQuantity <= (currentQuantityOfPool + currentFish.initQuantity)) {
                        pool.status = PoolStatus.Inactive;
                    }
                    pool.currentQuantity += currentFish.initQuantity;
                    await pool.save({transaction: t})
                    await FishService.updateFish(fish.fishId, {
                        ...currentFish,
                        status: fishStatus,
                        poolId: pool!.poolId
                    }, t)
                } else {
                    await FishService.updateFish(fish.fishId, {...currentFish, status: fishStatus}, t)
                }


            }
        }

        await t.commit();
        ok(res, "Update order success")
    } catch (e) {
        await t.rollback()
        next(e)
    }
}

export const getAllOrderEsign = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // const {status} = req.params;
        // const validStatus = Object.values(EsignStatus) as string[];
        // if (!status) {
        //     next();
        // } else if (!validStatus.includes(status)) {
        //     badRequest(res, "Invalid Status");
        //     return
        // }
        // const orders = await OrderEsignService.getAll(status as EsignStatus);
        const orders = await OrderEsignService.getAll();
        ok(res, "Get all order esign success", orders);
    } catch (e) {
        next(e);
    }
}

export const checkPriceCare = async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {
        const {orderId} = req.params;
        const {expireDate} = req.body;

        const order = await OrderSaleService.getAllOrderSalesByOrderId(Number(orderId));

        if (!order) {
            badRequest(res, "Order not found");
            return
        }

        let totalPrice = 0
        let count = countDate(new Date(), expireDate);
        console.log(count, new Date())
        if (count <= 3) {
            ok(res, "Free Service For 3 days");
            return
        }

        count -= 3;

        for (let orderDetail of order.orderDetails) {
            if (orderDetail.fishId) {
                const fish = await FishService.getFishByFishId(Number(orderDetail.fishId))
                if (!fish) {
                    badRequest(res, "Fish not found");
                    return;
                }
                const typeOfFish = estimateTypeFish(fish?.weight);
                const getFee = await FeeService.getById(typeOfFish);
                totalPrice += (getFee!.feed * count + getFee!.careFeed * count + getFee!.other) * 10000;


            } else {
                const packageItem = await PackageService.getPackageByPackageId(Number(orderDetail.packageId));
                const fish = await FishService.getFishByFishId(Number(packageItem?.fishId));
                if (!fish) {
                    badRequest(res, "Fish not found");
                    return;
                }
                const getFee = await FeeService.getById(5);
                totalPrice += (getFee!.feed * count + getFee!.careFeed * count + getFee!.other) * 10000;

            }
        }

        ok(res, "Get all order esign success", {
            orderId, totalPrice, expireDate
        });

    } catch (e) {

        next(e);

    }

}

export const confirmCareAfterBuy = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const t = await sequelize.transaction()
    try {
        const {orderId} = req.params;
        const {expireDate, userId} = req.body;
        const dataOrder: OrderEsignCreationAttributes = {
            userId: userId,
            status: EsignStatus.Pending,
            receiveDate: new Date(),
            expiryDate: expireDate,
            type: OrderEsginType.Care
        }

        const newOrderEsign = await OrderEsignService.createEsign(dataOrder, t);

        const order = await OrderSaleService.getAllOrderSalesByOrderId(Number(orderId));

        if (!order) {
            badRequest(res, "Order not found");
            return
        }

        let totalPrice = 0
        let count = countDate(new Date(), expireDate);

        count -= 3;

        for (let orderDetail of order.orderDetails) {
            if (orderDetail.fishId) {
                const fish = await FishService.getFishByFishId(Number(orderDetail.fishId))
                if (!fish) {
                    badRequest(res, "Fish not found");
                    return;
                }
                const typeOfFish = estimateTypeFish(fish?.weight);
                const getFee = await FeeService.getById(typeOfFish);
                totalPrice += (getFee!.feed * count + getFee!.careFeed * count + getFee!.other) * 10000;
                fish.status = Status.PendingCare;
                await fish.save({transaction: t})
                await OrderEsignService.createEsignDetail({
                    fishId: fish.fishId,
                    quantity: 1,
                    orderStatus: EsignStatus.Pending,
                    orderEsignId: newOrderEsign.orderEsignId,
                    numberOfHealthCheck: 0,
                    initPrice: (getFee!.feed * count + getFee!.careFeed * count + getFee!.other) * 10000
                }, t)

            } else {
                const packageItem = await PackageService.getPackageByPackageId(Number(orderDetail.packageId));
                const fish = await FishService.getFishByFishId(Number(packageItem?.fishId));
                if (!fish) {
                    badRequest(res, "Fish not found");
                    return;
                }
                const getFee = await FeeService.getById(5);
                totalPrice += (getFee!.feed * count + getFee!.careFeed * count + getFee!.other) * 10000 * (packageItem?.quantity ?? 0);
                await OrderEsignService.createEsignDetail({
                    packageId: packageItem?.packageId,
                    quantity: 1,
                    orderStatus: EsignStatus.Pending,
                    orderEsignId: newOrderEsign.orderEsignId,
                    numberOfHealthCheck: 0,
                    initPrice: (getFee!.feed * count + getFee!.careFeed * count + getFee!.other) * 10000 * (packageItem?.quantity ?? 0)
                }, t)
            }
        }
        await t.commit()
        created(res, "Create order success!", newOrderEsign);
    } catch (e) {

        next(e);

    }
}
export const getAllOrderEsignByBuyer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;

        const orders = await OrderEsignService.getAllByBuyerId(Number(userId));
        ok(res, "Get all order esign success", orders);
    } catch (e) {
        next(e);
    }
}

