
let disposeCount = 0;
const requestList = [];

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
 * @param timeStamp
 */
function onAnimationFrame(timeStamp) {
    const count = requestList.length;
    for (let loop = 0; loop < count; ++loop) {
        const entry = requestList[loop];

        if (!entry.disposing) {
            if (!entry.start) {
                entry.start = timeStamp;
            }

            entry.cb(timeStamp);
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
    requestList.forEach((entry) => {
        if (entry.cb === cb) {
            throw new Error('Animation request has already been made.');
        }
    });

    requestList.push({
        cb,
        start: 0,
        lastTime: 0,
        disposing: false,
    });

    if (requestList.length === 1) {
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
