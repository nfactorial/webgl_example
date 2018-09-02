/**
 * This module wraps the requestAnimationFrame API.
 * Application code may request an animation callback by invoking the requestAnimation method.
 * This method accepts a function, that will be invoked each animation step. It will be provided with the
 * delta time step that has elapsed since the last update.
 *
 * When an object no-longer wishes to receive animation callbacks, it should supply the function to the
 * cancelAnimation method.
 */

let lastTime = 0;
let disposeCount = 0;

const MILLISECONDS_PER_SECOND = 1000;

const requestList = [];

/**
 * Holds the object that will provide the animation system the current time stamp.
 * @type {Performance|Date}
 */
const timeProvider = (window.performance && window.performance.now) ? window.performance : Date;

/**
 * Removes all entities that are currently waiting to be removed from the list.
 */
function disposeEntries() {
    if (disposeCount) {
        for (let loop = 0; loop < requestList.length;) {
            if (requestList[loop].disposing) {
                requestList.splice(loop, 1);
            } else {
                loop += 1;
            }
        }

        disposeCount = 0;
    }
}

/**
 * Handles the animation frame supplied by the browser.
 * @param {number} timeStamp
 */
function onAnimationFrame(timeStamp) {
    const currentTime = timeProvider.now();
    const deltaTime = currentTime - lastTime;

    lastTime = currentTime;

    if (deltaTime > 0) {
        const count = requestList.length;
        for (let loop = 0; loop < count; ++loop) {
            const entry = requestList[loop];

            if (!entry.disposing) {
                if (!entry.start) {
                    entry.start = timeStamp;
                }

                entry.cb(deltaTime / MILLISECONDS_PER_SECOND);
            }
        }
    }

    disposeEntries();

    if (requestList.length) {
        requestAnimationFrame(onAnimationFrame);
    }
}

/**
 * Adds a new callback to the animation frame.
 * @param {function} cb - The callback to be invoked each animation frame.
 */
export function requestAnimation(cb) {
    const count = requestList.length;
    for (let loop = 0; loop < count; loop++) {
        if (!requestList[loop].disposing && requestList[loop].cb === cb) {
            throw new Error('Animation request has already been made.');
        }
    }

    requestList.push({
        cb,
        start: 0,
        lastTime: 0,
        disposing: false,
    });

    if (requestList.length === 1) {
        lastTime = timeProvider.now();
        requestAnimationFrame(onAnimationFrame);
    }
}

/**
 * Removes a previously registered callback from the animation frame.
 * @param {function} cb - The callback to be removed from the animation frame.
 */
export function cancelAnimation(cb) {
    const count = requestList.length;
    for (let loop = 0; loop < count; ++loop) {
        if (requestList[loop].cb === cb) {
            disposeCount++;
            requestList[loop].disposing = true;
            return;
        }
    }

    throw new Error('Callback was not registered for animation.');
}
