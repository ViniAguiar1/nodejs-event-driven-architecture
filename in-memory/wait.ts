export async function waitInMs(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function waitRandomInMS(minMs: number, maxMs: number){
    const randomMs = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return waitInMs(randomMs)
}