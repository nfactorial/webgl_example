import './application.css';

import * as WebGLDisplay from '@nfactorial/webgl_display';
import * as AnimationProvider from '../framwork/animation_provider';

import RENDER_PIPELINE from './render_pipeline.json';

WebGLDisplay.PipelineProvider.register(RENDER_PIPELINE);

/**
 * Core wrapper around our demonstration.
 * @implements IDrawRequestHandler
 */
export default class Application {
    constructor(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            throw new Error(`Could not find canvas element '${canvasId}'.`);
        }

        this.cameraPosition = WebGLDisplay.Math.Vector3.create();
        this.cameraOrientation = WebGLDisplay.Math.Quaternion.create();

        this.onAnimate = this.onAnimate.bind(this);

        this.renderer = new WebGLDisplay.Renderer();
        this.renderer.initialize(canvas, {
            webgl2: false,
        });

        // To render our content, we must create a display-port.
        this.displayPort = this.renderer.createDisplayPort(this, RENDER_PIPELINE.name);

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

    /**
     * Fills the supplied object with information about our camera.
     * @param {CameraArgs} cameraArgs - Object we must fill with information about our camera.
     */
    getCameraArgs(cameraArgs) {
        WebGLDisplay.Math.Quaternion.copy(cameraArgs.orientation, this.cameraOrientation);
        WebGLDisplay.Math.Vector3.copy(cameraArgs.position, this.cameraPosition);

        cameraArgs.fieldOfView = Math.PI / 2;
        cameraArgs.farPlane = 300;
        cameraArgs.nearPlane = 0.1;
        cameraArgs.type = WebGLDisplay.CameraType.Perspective;
    }

    /**
     * Method invoked when it's time to submit our draw calls to the framework.
     * @param {DrawRequestProvider} requestProvider - Object that will accept our draw calls.
     */
    onDrawRequest(requestProvider) {
    }
}
