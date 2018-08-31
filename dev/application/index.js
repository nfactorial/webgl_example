import './application.css';

import * as WebGLDisplay from '@nfactorial/webgl_display';
import * as AnimationProvider from '../framwork/animation_provider';

export default class Application {
    constructor(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            throw new Error(`Could not find canvas element '${canvasId}'.`);
        }

        this.onAnimate = this.onAnimate.bind(this);

        this.renderer = new WebGLDisplay.Renderer();
        this.renderer.initialize(canvas, {
            webgl2: false
        });

        // To render our content, we must create a display-port.
        this.displayPort = this.renderer.createDisplayPort();

        AnimationProvider.requestAnimation(this.onAnimate);
    }

    /**
     * Destroys the application.
     */
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }

        AnimationProvider.cancelAnimation(this.onAnimate);
    }

    /**
     * This callback is invoked each frame update, allowing us to perform any animation required.
     */
    onAnimate() {
        this.renderer.renderFrame();
    }
}
