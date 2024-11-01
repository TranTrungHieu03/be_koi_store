import EsginInfo, {EsignInfoCreationAttributes} from "../../models/esign-info.model";
import EsignInfoModel from "../../models/esign-info.model";

export class EsginInfoService {
    static async GetAll(): Promise<EsginInfo[]> {
        return await EsignInfoModel.findAll({order: ["createdAt", "DESC"]});
    }

    static async GetOne(esignInfoId: number): Promise<EsginInfo | null> {
        return EsignInfoModel.findByPk(esignInfoId)
    }

    static async GetByOrderDetailId(orderEsignDetailId: number): Promise<EsginInfo[]> {
        return await EsignInfoModel.findAll({where: {orderEsignDetailId}, order: ["createdAt", "DESC"]});
    }

    static async GetByStaffId(staffId: number): Promise<EsginInfo[]> {
        return await EsignInfoModel.findAll({where: {staffId}, order: ["createdAt", "DESC"]});
    }

    static async Create(data: EsignInfoCreationAttributes): Promise<EsginInfo> {
        return EsignInfoModel.create(data);
    }

    static async Update(esignInfoId: number, data: EsignInfoCreationAttributes): Promise<boolean> {
        const [updateRows] = await EsignInfoModel.update(data, {
            where: {
                esignInfoId
            }
        })
        return updateRows > 0
    }

}