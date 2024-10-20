export function getDiscountLongDuration(numberOfDate: number): number {
    if (numberOfDate > 7 && numberOfDate <= 15) {
        return 0.03;
    } else if (numberOfDate > 15 && numberOfDate <= 30) {
        return 0.05
    } else if (numberOfDate > 30) {
        return 0.07
    } else {
        return 0
    }
}