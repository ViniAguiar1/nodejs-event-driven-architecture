export function availableToSale(failureChance: number):boolean {
    return Math.random() > failureChance;
}