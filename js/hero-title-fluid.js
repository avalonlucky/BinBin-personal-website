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
      vec2 uv=v_uv;float t=u_time*.14;
      float warp=.28*sin(uv.y*3.2+t*.7)+.10*sin(uv.y*7.1-t*.4);
      float phase=uv.x*7.2+warp-t*.9;
      float satin=.5+.5*sin(phase);
      float fold=.5+.5*sin(phase+1.35+.32*sin(uv.y*5.4+t*.45));
      float shadow=smoothstep(.43,.72,fold);
      float blue=smoothstep(.18,.82,satin);
      float rim=pow(max(0.,1.-abs(satin-.52)*2.),7.);
      float cross=.5+.5*sin(uv.y*4.0-uv.x*1.1+t*.38);
      vec3 ink=vec3(.002,.004,.011),navy=vec3(.006,.025,.12),cobalt=vec3(.015,.18,.94),electric=vec3(.34,.54,1.);
      vec3 color=mix(ink,navy,blue*.48);
      color=mix(color,cobalt,blue*.72*(.72+.28*cross));
      color=mix(color,ink,shadow*.76);
      color=mix(color,electric,rim*.58);
      color*=.92+.08*cos((uv.y-.5)*3.14159);
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
