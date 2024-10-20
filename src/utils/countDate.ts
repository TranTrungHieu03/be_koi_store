export function countDate(startDate: Date, endDate: Date): number {
    const start: Date = new Date(startDate);
    const end: Date = new Date(endDate);

    const timeDiff: number = end.getTime() - start.getTime();

    const daysDiff: number = timeDiff / (1000 * 60 * 60 * 24);

    return Math.ceil(daysDiff);
}