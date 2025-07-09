precision highp float;

varying vec2 vUV;
uniform sampler2D textureSampler;

void main(void) {
  vec4 color = texture2D(textureSampler, vUV);

  // Simulate watercolor by reducing contrast and adding softness
  vec3 washedColor = color.rgb * 0.8 + 0.2 * vec3(0.9, 0.9, 0.85);

  // Optional: add blotchiness based on screen-space noise
  float blotch = sin(vUV.x * 100.0) * cos(vUV.y * 100.0);
  washedColor += blotch * 0.03;

  gl_FragColor = vec4(washedColor, color.a);
}