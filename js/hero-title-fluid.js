(function () {
  const canvas = document.querySelector('[data-hero-title-fluid]');
  const title = canvas?.closest('h1');
  const lines = title ? [...title.querySelectorAll('span')] : [];
  if (!canvas || !title || !lines.length) return;

  const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) return;
  const vertexSource = `#version 300 es
    in vec2 a_position; out vec2 v_uv;
    void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;
  const fragmentSource = `#version 300 es
    precision highp float;
    in vec2 v_uv; out vec4 outColor;
    uniform sampler2D u_mask; uniform float u_time; uniform vec2 u_resolution;
    void main(){
      vec2 uv=v_uv;float t=u_time*.22;
      float center=.5+.34*sin(t*.42);float bend=.12*sin(uv.y*4.2+t*.55)+.045*sin(uv.y*8.5-t*.3);float d=uv.x-center-bend;
      float body=exp(-d*d*4.4);float blueFold=exp(-pow(d-.045,2.)*19.);float darkFold=exp(-pow(d+.025,2.)*68.);float shine=exp(-pow(d-.14,2.)*105.);
      float secondCenter=.5+.2*sin(uv.x*3.4-t*.38);float d2=uv.y-secondCenter;float second=exp(-d2*d2*17.)*(.5+.5*sin(t*.26+uv.x*2.));
      vec3 ink=vec3(.004,.006,.014),midnight=vec3(.01,.035,.17),cobalt=vec3(.025,.20,.92),electric=vec3(.38,.56,1.);
      vec3 color=mix(ink,midnight,body*.88);color=mix(color,cobalt,blueFold*.82+second*.2);color=mix(color,ink,darkFold*.8);color=mix(color,electric,shine*.72);
      color+=cobalt*second*.16;color*=.94+.06*cos(uv.y*3.14159);
      float mask=texture(u_mask,vec2(uv.x,1.-uv.y)).r;outColor=vec4(color*mask,mask);
    }`;

  function compile(type, source) {
    const item = gl.createShader(type); gl.shaderSource(item, source); gl.compileShader(item);
    if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(item));
    return item;
  }
  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch (error) { console.warn('Fluid title shader unavailable:', error); return; }

  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const maskCanvas = document.createElement('canvas'); const maskContext = maskCanvas.getContext('2d'); const maskTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, maskTexture); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const timeLocation=gl.getUniformLocation(program,'u_time'), resolutionLocation=gl.getUniformLocation(program,'u_resolution');
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches; let active=true,frame=0;

  function resize(){
    const rect=title.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(rect.width*ratio));canvas.height=Math.max(1,Math.round(rect.height*ratio));maskCanvas.width=canvas.width;maskCanvas.height=canvas.height;
    maskContext.setTransform(ratio,0,0,ratio,0,0);maskContext.clearRect(0,0,rect.width,rect.height);const style=getComputedStyle(title);maskContext.fillStyle='#fff';maskContext.textAlign='center';maskContext.textBaseline='middle';maskContext.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;if('letterSpacing' in maskContext)maskContext.letterSpacing=style.letterSpacing;
    lines.forEach(line=>{const box=line.getBoundingClientRect();maskContext.fillText(line.textContent,rect.width/2,box.top-rect.top+box.height/2);});
    gl.bindTexture(gl.TEXTURE_2D,maskTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.R8,gl.RED,gl.UNSIGNED_BYTE,maskCanvas);render(reduceMotion?2800:0);title.classList.add('is-fluid-ready');
  }
  function render(ms){gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,maskTexture);gl.uniform1i(gl.getUniformLocation(program,'u_mask'),0);gl.uniform1f(timeLocation,ms/1000);gl.uniform2f(resolutionLocation,canvas.width,canvas.height);gl.drawArrays(gl.TRIANGLES,0,3);}
  function tick(time){if(active)render(time);if(!reduceMotion)frame=requestAnimationFrame(tick);}
  new IntersectionObserver(([entry])=>{active=entry.isIntersecting;},{threshold:.05}).observe(title);
  document.fonts.ready.then(()=>{resize();if(!reduceMotion)frame=requestAnimationFrame(tick);});window.addEventListener('resize',resize);window.addEventListener('pagehide',()=>cancelAnimationFrame(frame),{once:true});
})();
