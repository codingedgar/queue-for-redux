import { createTransform } from 'redux-persist'
import _ from 'lodash'

const OMIT_KEYS = ['suspendSaga']

/**
 * Custom redux-persist transformation
 * to omit persisting `autoEnqueue` key from offline queue.
 */
export default createTransform(
  inboundState => _.omit(inboundState, OMIT_KEYS),
  outboundState => outboundState,
  { whitelist: ['offline'] },
)
