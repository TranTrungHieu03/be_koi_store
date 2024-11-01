import cron from 'node-cron';
import {OrderSaleService} from "../order-sale/order-sale.service";

export const orderCron = () => {
    console.log('Đang kiểm tra và hủy đơn hàng chưa thanh toán...');
    cron.schedule('*/5 * * * *', async () => {
        await OrderSaleService.cancelOrder()
    });

}
