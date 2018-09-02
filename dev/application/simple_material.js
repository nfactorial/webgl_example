import { AttributeType } from '@nfactorial/webgl_helper';

const VERTEX_SHADER_SRC = [
    'precision mediump float;',
    '',
    'attribute vec3 position;',
    '',
    'uniform mat4 worldTransform;',
    'uniform mat4 viewTransform;',
    'uniform mat4 projectionTransform;',
    '',
    'void main() {',
    '    vec4 worldPosition = worldTransform * vec4(position, 1.0);',
    '    vec4 viewPosition = viewTransform * worldPosition;',
    '    gl_Position = projectionTransform * viewPosition;',
    '}',
    '',
].join('\n');

const FRAGMENT_SHADER_SRC = [
    'precision mediump float;',
    '',
    'void main() {',
    '    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);',
    '}',
].join('\n');

const ATTRIBUTES = [
    {
        name: 'position',
        type: AttributeType.Float,
        size: 3,
        normalized: false,
        stride: 0,
    },
];

const SIMPLE_MATERIAL = {
    name: 'simple',
    phase: 'main',
    vertexShader: VERTEX_SHADER_SRC,
    fragmentShader: FRAGMENT_SHADER_SRC,
    attributes: ATTRIBUTES,
};

export default SIMPLE_MATERIAL;
