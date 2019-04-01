type meta = {
    id: string,
    times: number,
    ttl?: string
}
type action = {
    meta?: meta,
    payload?: any,
    type: string
}