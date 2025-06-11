precision highp float;

// 1️⃣ Tell GLSL we’re going to use instancing:
#ifdef INSTANCES
#include<instancesDeclaration>   // declares `attribute mat4 instancesMatrix;`
#endif

// Your vertex attributes:
attribute vec3 position;
attribute vec2 uv;
attribute vec3 faceNormal;

// Uniforms
uniform mat4 worldViewProjection;
uniform float time;

// Varyings to the fragment shader
varying vec2 vUV;
varying vec3 vFaceNormal;

void main() {
    vUV = uv;
    vFaceNormal = faceNormal;

    // 2️⃣ Apply instanced world transform if INSTANCES is defined:
    vec4 worldPos = vec4(position, 1.0);
    #ifdef INSTANCES
    #include<instancesVertex>   // expands to: worldPos = instancesMatrix * worldPos;
    #endif

    // Now project into clip space:
    gl_Position = worldViewProjection * worldPos;
}
