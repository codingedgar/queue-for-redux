/**
 * Initial state for the offline queue.
 *
 * @param {Array} queue Keeps an array of redux actions that are queued in the offline mode.
 * @param {Boolean} autoEnqueue Boolean indicating if the device is connected to the Internet.
 */
export default {
    queue: [],
    suspendSaga: true,
}
