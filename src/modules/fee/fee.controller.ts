import {NextFunction, Request, Response} from "express";
import {FeeCreationAttributes} from "../../models/fee.model";
import {FeeService} from "./fee.service";
import {created} from "../../utils/util";

export const autoCreateFee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data: FeeCreationAttributes[] = [
            {
                fishType: 1,
                feed: 1,
                careFeed: 3,
                careEsign: 1,
                other: 5,
                healthCheck: 10
            },
            {
                fishType: 2,
                feed: 2,
                careFeed: 5,
                careEsign: 2,
                other: 7,
                healthCheck: 15
            },
            {
                fishType: 3,
                feed: 3,
                careFeed: 7,
                careEsign: 3,
                other: 10,
                healthCheck: 30
            },
            {
                fishType: 4,
                feed: 5,
                careFeed: 15,
                careEsign: 7,
                other: 20,
                healthCheck: 50
            },
            {
                fishType: 5,
                feed: 3,
                careFeed: 2,
                careEsign: 1,
                other: 3,
                healthCheck: 2
            }
        ];
        for (let fee of data) {
            await FeeService.create(fee);
        }
        created(res)
    } catch (e) {

        next(e);
    }

}