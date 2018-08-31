import Application from './application';

const CANVAS_ID = 'application-canvas';

let ApplicationInstance = null;

window.addEventListener('load', () => {
    if (ApplicationInstance) {
        throw new Error('Application created multiple times.');
    }

    ApplicationInstance = new Application(CANVAS_ID);
});
