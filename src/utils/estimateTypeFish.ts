export const estimateTypeFish = (weight: number) => {
    if (weight <= 500) {
        return 1
    } else if (weight > 500 && weight <= 2000) {
        return 2
    } else if (weight > 2000 && weight <= 10000) {
        return 3
    } else {
        return 4
    }
}