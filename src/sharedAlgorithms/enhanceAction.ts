
import {v1 as uuid} from 'uuid'
import { over, lensPath } from 'ramda';
import moment from 'moment'

export function enhace(action) {

    return over<meta, action>(
        lensPath<action, action>(['meta', 'queue']),
        meta => ({
            ...meta,
            id: meta.id || uuid(),
            times: (meta.times || 0) + 1,
            ttl: meta.ttl || moment().add(1, 'day').toISOString(),
            throttle: moment().add(1, 'minute').toISOString(),
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
