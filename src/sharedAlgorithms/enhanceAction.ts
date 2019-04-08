
import { v1 as uuid } from 'uuid'
import { over, lensPath, set } from 'ramda';
import moment from 'moment'


export function enhanceResetThrottle(action: action):any {
    return set<string, action>(
        lensPath<any, any>(['meta', 'queue', 'throttle']),
        moment().toISOString(),
        action
    )
}

export function enhace(config: Config, action) {

    return over<meta, action>(
        lensPath<action, action>(['meta', 'queue']),
        meta => ({
            ...meta,
            id: meta.id || uuid(),
            times: (meta.times || 0) + 1,
            ttl: meta.ttl || moment().add(moment.duration(config.ttl)).toISOString(),
            throttle: moment().add(moment.duration(config.throttle)).toISOString(),
        }),
        action
    )

}

export function enhaceInitial(action) {

    return over<meta, action>(
        lensPath<action, action>(['meta', 'queue']),
        meta => ({
            ...meta,
            id: meta.id || uuid(),
            times: meta.times || 0,
        }),
        action
    )

}
