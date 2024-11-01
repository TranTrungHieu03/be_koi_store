export type CreateOrderSaleRequest = {
    buyerId: number;
    voucherCode: string;

    fishesOrder: {
        uniqueFishes: [
            {
                id: number; // A
                quantity: number;
            },

        ];
        packageFishes: [
            {
                id: number; // E
                quantity: number; // 12
            },

        ];
    };
};

/**
 * User mua:
 * - Cá thể: A, B, C (number cá thể luôn = 1)
 * - Cá lô: E (12 con), F (8 con)
 */
