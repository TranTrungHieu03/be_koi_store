import {FishCreationAttributes} from "../../models/fish.model";
import {OrderEsginType} from "../../contants/enums";

interface EsignDataDetail extends FishCreationAttributes {
    isNeedEstimated?: boolean;
    numberOfHealthCheck: number;
    orderEsignDetailId?:number;
    isNewBuy?:true
}

export type OrderEsginRequestCreation = {
    buyerId: number,
    staffId?: number,
    type: OrderEsginType
    receiveDate: Date,
    expireDate: Date
    fishes: EsignDataDetail[],
}