/* Lightweight WebGL2 gravity-like background inspired by gravity-example */
(function(){
  'use strict';
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();

  function init(){
    if (document.body.dataset.siteWebgl !== 'on') return;
    const canvas = document.createElement('canvas');
    canvas.className = 'site-webgl-canvas';
    Object.assign(canvas.style,{ position:'fixed', inset:'0', zIndex:'0', pointerEvents:'none' });
    document.body.insertBefore(canvas, document.body.firstChild);

    const gl = canvas.getContext('webgl2', { antialias:false, depth:false, stencil:false, premultipliedAlpha:false, alpha:true });
    if(!gl){ console.warn('WebGL2 not available, falling back to ambient canvas'); return; }

    let width=0, height=0, dpr=1; let time=0; let scroll=0.0;

    const vertSrc = `#version 300 es
    precision highp float;
    const vec2 verts[3] = vec2[3](
      vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0)
    );
    out vec2 vUv;
    void main(){
      vec2 p = verts[gl_VertexID];
      vUv = p*0.5+0.5; // not used but handy
      gl_Position = vec4(p,0.0,1.0);
    }`;

    // Fragment shader: multi-attractor field + soft color blend
    const fragSrc = `#version 300 es
    precision highp float;
    out vec4 o;
    uniform vec2 u_res; 
    uniform float u_time; 
    uniform float u_scroll; 

    float field(vec2 p, vec2 c, float str){
      float d = length(p-c);
      return str/(d*d + 0.005);
    }

    void main(){
      vec2 uv = gl_FragCoord.xy / u_res;
      vec2 p = (uv - 0.5);
      p.x *= u_res.x/u_res.y;

      // Attractors moving slowly
      vec2 a1 = vec2(0.35*sin(u_time*0.12+0.0), 0.25*cos(u_time*0.10)+0.05*u_scroll);
      vec2 a2 = vec2(0.40*cos(u_time*0.09+1.7), -0.30*sin(u_time*0.11)+0.03*u_scroll);
      vec2 a3 = vec2(-0.45*sin(u_time*0.07+3.1), 0.35*cos(u_time*0.08)-0.02*u_scroll);

      float f = 0.0;
      f += field(p, a1, 0.020);
      f += field(p, a2, 0.018);
      f += field(p, a3, 0.016);

      // Base colors
      vec3 c1 = vec3(0.043, 0.059, 0.082);      // deep blue/black
      vec3 c2 = vec3(0.231, 0.604, 0.996);      // blue
      vec3 c3 = vec3(0.658, 0.353, 0.969);      // purple
      vec3 c4 = vec3(1.0, 0.42, 0.21);          // warm accent

      float m1 = smoothstep(0.00, 0.35, f);
      float m2 = smoothstep(0.20, 0.60, f);
      float m3 = smoothstep(0.45, 0.90, f);

      vec3 col = c1;
      col = mix(col, c2, m1*0.6);
      col = mix(col, c3, m2*0.5);
      col = mix(col, c4, m3*0.3);

      // Subtle vignette
      float vig = smoothstep(0.95, 0.25, length(uv-0.5));
      col *= mix(0.85, 1.0, vig);

      o = vec4(col, 1.0);
    }`;

    const prog = createProgram(gl, vertSrc, fragSrc);
    const uRes = gl.getUniformLocation(prog,'u_res');
    const uTime = gl.getUniformLocation(prog,'u_time');
    const uScroll = gl.getUniformLocation(prog,'u_scroll');

    function resize(){
      dpr = Math.min(window.devicePixelRatio||1, 2);
      width = Math.floor(window.innerWidth);
      height = Math.floor(window.innerHeight);
      canvas.width = Math.floor(width*dpr);
      canvas.height = Math.floor(height*dpr);
      canvas.style.width = width+'px';
      canvas.style.height = height+'px';
      gl.viewport(0,0,canvas.width,canvas.height);
    }
    function onScroll(){ scroll = (window.scrollY||0) / Math.max(1, document.body.scrollHeight - window.innerHeight); }

    function frame(t){
      time = t*0.001;
      gl.useProgram(prog);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uScroll, scroll);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    resize(); onScroll(); requestAnimationFrame(frame);

    function createShader(gl, type, src){
      const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(sh)); gl.deleteShader(sh); return null; }
      return sh;
    }
    function createProgram(gl, vsSrc, fsSrc){
      const vs = createShader(gl, gl.VERTEX_SHADER, vsSrc);
      const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSrc);
      const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(pr)); gl.deleteProgram(pr); return null; }
      return pr;
    }
  }
})();
