import Fee, {FeeCreationAttributes} from "../../models/fee.model";

export class FeeService {
    static async create(data: FeeCreationAttributes) {
        try {
            return await Fee.create(data)
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async getAll() {
        try {
            return await Fee.findAll()
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }

    static async getById(feeId: number) {
        try {
            return await Fee.findByPk(feeId)
        } catch (e: any) {
            throw Error(e.message || "Something went wrong.");
        }
    }
}