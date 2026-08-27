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
      vec2 frag=v_uv*u_resolution;
      vec2 p=(frag*2.-u_resolution)/u_resolution.y;
      float t=u_time*.12;
      float total=0.;float weight=0.;
      for(float layer=0.;layer<4.;layer++){
        vec2 q=p*.88;
        q+=vec2(.42*sin(t*.31+layer*1.7),.34*cos(t*.24-layer*1.3));
        float a=1.9+layer*.74;float d=-.8+layer*1.13;
        for(int j=2;j<9;j++){
          float fj=float(j);
          q+=.28*sin(q.yx*fj*.62+t+vec2(a,d))/fj;
          a+=cos(fj+d+q.x*1.8-t*.7);
          d+=sin(fj*q.y+a+t*.55);
        }
        float v=.5+.5*sin(length(q+vec2(a,d)*.15)*1.34+layer*layer*.72);
        float w=sin((layer+.5)*.785398);
        total+=v*w;weight+=w;
      }
      float val=smoothstep(.08,.92,total/weight);
      vec3 black=vec3(.001,.002,.008),deep=vec3(.002,.012,.09),blue=vec3(.012,.13,.92),light=vec3(.27,.42,1.);
      vec3 color;
      if(val<.34) color=mix(black,deep,val/.34);
      else if(val<.58) color=mix(deep,blue,(val-.34)/.24);
      else if(val<.80) color=mix(blue,light,(val-.58)/.22);
      else color=mix(light,blue,(val-.80)/.20);
      color=pow(color,vec3(.92));
      float mask=texture(u_mask,vec2(v_uv.x,1.-v_uv.y)).r;outColor=vec4(color*mask,mask);
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
