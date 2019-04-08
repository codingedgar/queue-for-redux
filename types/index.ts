type meta = {
    id: string,
    times: number,
    ttl?: string,
    throttle?: string
}
type action = {
    meta?: meta,
    payload?: any,
    type: string,
}

type UserConfig = {
    stateName?: string,
    throttle?: string,
    ttl?: string
}

type Config = {
    stateName: string,
    throttle: string,
    ttl: string
}

type MiddlewareContext = {
    config: Config,
    getState,
    dispatch,
    next,
    action
}