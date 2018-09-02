import './application.css';

import * as WebGLHelper from '@nfactorial/webgl_helper';
import * as WebGLDisplay from '@nfactorial/webgl_display';
import * as AnimationProvider from '../framwork/animation_provider';

import RENDER_PIPELINE from './render_pipeline.json';
import SIMPLE_MATERIAL from './simple_material';

WebGLDisplay.PipelineProvider.register(RENDER_PIPELINE);

/**
 * Helper method, creates a material from the supplied description.
 * @param gl
 * @param desc
 * @returns {Material}
 * @private
 */
function createMaterial(gl, desc) {
    const material = new WebGLDisplay.Material();

    material.phase = desc.phase;
    material.program = new WebGLHelper.Program();
    material.program.initialize(gl, desc.vertexShader, desc.fragmentShader);
    material.program.setAttributes(desc.attributes);

    material.initialize(gl);

    return material;
}

/**
 * Core wrapper around our demonstration.
 *
 * Note that the current API is still in its raw form, another module will arrive in the future that
 * allows us to create meshes and entities. This example application is intended to demonstrate that
 * the lower level API is usable.
 *
 * @implements IDrawRequestHandler
 */
export default class Application {
    constructor(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            throw new Error(`Could not find canvas element '${canvasId}'.`);
        }

        this.gl = null;

        this.cameraPosition = WebGLDisplay.Math.Vector3.create();
        this.cameraOrientation = WebGLDisplay.Math.Quaternion.create();

        this.position = WebGLDisplay.Math.Vector3.create();
        this.orientation = WebGLDisplay.Math.Quaternion.create();
        this.drawRequest = new WebGLDisplay.DrawRequest();

        this.onAnimate = this.onAnimate.bind(this);

        this.renderer = new WebGLDisplay.Renderer();
        this.renderer.initialize(canvas, {
            webgl2: false,
        });

        this.timer = 0;

        // To render our content, we must create a display-port.
        this.displayPort = this.renderer.createDisplayPort(this, RENDER_PIPELINE.name);
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
     * Prepares the application for rendering
     */
    onInitialize() {
        WebGLDisplay.Math.Matrix4.identity(this.orientation);
        WebGLDisplay.Math.Vector3.set(this.position, 0, 0, -10);

        const gl = this.renderer.context;

        const vertices = new Float32Array(3 * 3);

        vertices[0] = -0.5;
        vertices[1] = 0.5;
        vertices[2] = 0;

        vertices[3] = 0;
        vertices[4] = -0.5;
        vertices[5] = 0;

        vertices[6] = 0.5;
        vertices[7] = 0.5;
        vertices[8] = 0;

        const material = createMaterial(gl, SIMPLE_MATERIAL);

        this.drawRequest.vertexBuffer = new WebGLHelper.ArrayBuffer();
        this.drawRequest.vertexBuffer.initialize(gl, gl.STATIC_DRAW);
        this.drawRequest.vertexBuffer.bind(this.renderer.state);
        this.drawRequest.vertexBuffer.bufferData(vertices);

        this.drawRequest.primitiveType = WebGLHelper.PrimitiveType.TriangleList;
        this.drawRequest.start = 0;
        this.drawRequest.primitiveCount = 1;
        this.drawRequest.materialInstance = material.createInstance();

        this.gl = gl;

        AnimationProvider.requestAnimation(this.onAnimate);
    }

    /**
     * This callback is invoked each frame update, allowing us to perform any animation required.
     */
    onAnimate(deltaTime) {
        this.timer += deltaTime;

        WebGLDisplay.Math.Quaternion.identity(this.orientation);
        WebGLDisplay.Math.Quaternion.rotateZ(this.orientation, this.orientation, this.timer);

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
        // Viewport will also be the responsibility of the rendering framework
        this.gl.viewport(0, 0, 640, 480);

        // TODO: This will eventually be managed by the scene
        WebGLDisplay.Math.Matrix4.fromRotationTranslation(this.drawRequest.worldTransform, this.orientation, this.position);
        WebGLDisplay.Math.Vector3.copy(this.drawRequest.worldPosition, this.position);

        requestProvider.addRequest(this.drawRequest);
    }
}
