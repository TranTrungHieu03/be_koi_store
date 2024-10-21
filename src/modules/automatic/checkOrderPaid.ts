import cron from 'node-cron';
import {OrderSaleService} from "../order-sale/order-sale.service";


cron.schedule('*/10 * * * *', async () => {
    await OrderSaleService.cancelOrder()
});
