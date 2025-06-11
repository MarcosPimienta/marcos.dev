precision highp float;

varying vec2 vUV;
varying vec3 vFaceNormal;

uniform sampler2D leafTexture;
uniform float time;

void main() {
    vec4 col = texture2D(leafTexture, vUV);
    if (col.a < 0.1) discard;

    float light = max(dot(normalize(vFaceNormal), vec3(0.0,1.0,0.0)), 0.0);
    light *= 0.8 + 0.2 * sin(time * 0.5);

    gl_FragColor = vec4(col.rgb * light, col.a);
}