import Voucher, {VoucherCreationAttributes} from "../../models/voucher.model";
import sequelize, {Transaction} from "sequelize";

export class VoucherService {
    static async getAllVouchers() {
        return Voucher.findAll();
    }



    static async create(data: VoucherCreationAttributes): Promise<Voucher | null> {
        try {
            return await Voucher.create(data
            )
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async findByCode(code: string): Promise<Voucher | null> {
        try {
            return await Voucher.findOne({where: {code}})
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async updateQuantity(voucherId: number, transaction?: Transaction): Promise<boolean> {
        try {
            const [updateRows] =
                await Voucher.update({remainQuantity: sequelize.literal('remainQuantity - 1')}, {
                    where: {
                        voucherId
                    }, transaction
                });
            return updateRows > 0;
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }
}
