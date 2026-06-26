(function(){'use strict';

/* ═══════════════════════════════════════════════
   THREE.JS — HERO CANVAS: full immersive scene
   Neural network + particle nebula + geometric mesh
═══════════════════════════════════════════════ */
(function heroScene(){
  const canvas = document.getElementById('heroCanvas');
  if(!canvas||!window.THREE) return;
  const R = THREE;
  const renderer = new R.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0x000000,0);
  const scene = new R.Scene();
  const camera = new R.PerspectiveCamera(55,1,0.1,2000);
  camera.position.set(0,0,80);

  function resize(){
    const w=canvas.clientWidth,h=canvas.clientHeight;
    renderer.setSize(w,h,false);
    camera.aspect=w/h; camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize',resize,{passive:true});

  /* — large background gradient plane */
  const bgGeo = new R.PlaneGeometry(400,300);
  const bgMat = new R.ShaderMaterial({
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`
      varying vec2 vUv;
      uniform float t;
      void main(){
        vec2 uv=vUv;
        float d=length(uv-vec2(.5,.5));
        vec3 c1=vec3(.04,.08,.1);
        vec3 c2=vec3(.07,.3,.35)*(.5+.5*sin(t*.4+d*4.));
        vec3 c3=vec3(.06,.19,.22);
        vec3 col=mix(c1,mix(c2,c3,uv.y),smoothstep(.8,.0,d));
        float vignette=smoothstep(1.,0.2,d*1.4);
        gl_FragColor=vec4(col*vignette,vignette*.95);
      }`,
    uniforms:{t:{value:0}},
    transparent:true,depthWrite:false,side:R.DoubleSide
  });
  const bg = new R.Mesh(bgGeo,bgMat);
  bg.position.z=-100;
  scene.add(bg);

  /* — neural net nodes */
  const nodeCount=60;
  const nodeMeshes=[];
  const nodePositions=[];
  for(let i=0;i<nodeCount;i++){
    const x=(Math.random()-.5)*180,y=(Math.random()-.5)*100,z=(Math.random()-.5)*60;
    nodePositions.push(new R.Vector3(x,y,z));
    const g=new R.SphereGeometry(0.35+Math.random()*.4,8,8);
    const m=new R.MeshBasicMaterial({color:Math.random()<.5?0xFFC801:0xFF9932,transparent:true,opacity:0.6+Math.random()*.4});
    const mesh=new R.Mesh(g,m);
    mesh.position.set(x,y,z);
    scene.add(mesh);
    nodeMeshes.push({mesh,oy:y,phase:Math.random()*Math.PI*2,speed:0.003+Math.random()*.006});
  }
  /* edges between near nodes */
  const edgeGeo=new R.BufferGeometry();
  const edgePts=[];
  for(let i=0;i<nodeCount;i++){
    for(let j=i+1;j<nodeCount;j++){
      const d=nodePositions[i].distanceTo(nodePositions[j]);
      if(d<28){
        edgePts.push(nodePositions[i].x,nodePositions[i].y,nodePositions[i].z);
        edgePts.push(nodePositions[j].x,nodePositions[j].y,nodePositions[j].z);
      }
    }
  }
  edgeGeo.setAttribute('position',new R.BufferAttribute(new Float32Array(edgePts),3));
  const edgeMat=new R.LineBasicMaterial({color:0x114C5A,transparent:true,opacity:0.25});
  scene.add(new R.LineSegments(edgeGeo,edgeMat));

  /* — large nebula particle cloud */
  const pCount=1800;
  const pPos=new Float32Array(pCount*3);
  const pCol=new Float32Array(pCount*3);
  const clrs=[new R.Color(0x114C5A),new R.Color(0x1a6070),new R.Color(0xFFC801),new R.Color(0xFF9932),new R.Color(0x0a2030)];
  for(let i=0;i<pCount;i++){
    const r=60+Math.random()*100;
    const theta=Math.random()*Math.PI*2,phi=Math.acos(Math.random()*2-1);
    pPos[i*3]=r*Math.sin(phi)*Math.cos(theta);
    pPos[i*3+1]=r*Math.sin(phi)*Math.sin(theta);
    pPos[i*3+2]=r*Math.cos(phi)-40;
    const c=clrs[Math.floor(Math.random()*clrs.length)];
    pCol[i*3]=c.r;pCol[i*3+1]=c.g;pCol[i*3+2]=c.b;
  }
  const pGeo=new R.BufferGeometry();
  pGeo.setAttribute('position',new R.BufferAttribute(pPos,3));
  pGeo.setAttribute('color',new R.BufferAttribute(pCol,3));
  const pMat=new R.PointsMaterial({size:0.7,vertexColors:true,transparent:true,opacity:0.55,sizeAttenuation:true});
  scene.add(new R.Points(pGeo,pMat));

  /* — wireframe icosahedron */
  const iGeo=new R.IcosahedronGeometry(22,1);
  const iMat=new R.MeshBasicMaterial({color:0x114C5A,wireframe:true,transparent:true,opacity:0.08});
  const ico=new R.Mesh(iGeo,iMat); ico.position.set(40,-10,-20); scene.add(ico);

  /* — torus knot */
  const tkGeo=new R.TorusKnotGeometry(16,3.5,140,14);
  const tkMat=new R.MeshBasicMaterial({color:0x0d3a46,wireframe:true,transparent:true,opacity:0.1});
  const tk=new R.Mesh(tkGeo,tkMat); tk.position.set(-50,10,-30); scene.add(tk);

  /* — glowing ring */
  const rGeo=new R.TorusGeometry(18,0.25,8,80);
  const rMat=new R.MeshBasicMaterial({color:0xFFC801,transparent:true,opacity:0.18});
  const ring=new R.Mesh(rGeo,rMat); ring.rotation.x=1.1; ring.position.set(10,30,-40); scene.add(ring);

  /* mouse */
  let mx=0,my=0;
  window.addEventListener('mousemove',e=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2;},{passive:true});

  let t=0;
  (function loop(){
    requestAnimationFrame(loop);
    t+=0.01;
    bgMat.uniforms.t.value=t;
    nodeMeshes.forEach(n=>{n.mesh.position.y=n.oy+Math.sin(t*n.speed*100+n.phase)*3;n.mesh.material.opacity=0.4+0.5*Math.abs(Math.sin(t*n.speed*50+n.phase));});
    ico.rotation.x+=0.004; ico.rotation.y+=0.006;
    tk.rotation.x+=0.003; tk.rotation.y+=0.004;
    ring.rotation.z+=0.002;
    camera.position.x+=(mx*12-camera.position.x)*.04;
    camera.position.y+=(-my*7-camera.position.y)*.04;
    camera.lookAt(0,0,0);
    renderer.render(scene,camera);
  })();
})();

/* ═══════════════════════════════════════════════
   THREE.JS — MINI DASHBOARD CANVAS (hero right)
   Live bar chart + sine wave animation
═══════════════════════════════════════════════ */
(function dashMini(){
  const canvas=document.getElementById('dashMiniCanvas');
  if(!canvas) return;
  function resize(){canvas.width=canvas.clientWidth*devicePixelRatio;canvas.height=canvas.clientHeight*devicePixelRatio;}
  resize(); window.addEventListener('resize',resize,{passive:true});
  const ctx=canvas.getContext('2d');
  const barData=[0.4,0.65,0.5,0.8,0.6,0.9,0.7,0.55,0.85,0.72,0.95,0.68];
  let t=0;
  (function loop(){
    requestAnimationFrame(loop);
    t+=0.025;
    const W=canvas.width,H=canvas.height;
    ctx.clearRect(0,0,W,H);
    // grid lines
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(0,H*i/4);ctx.lineTo(W,H*i/4);ctx.stroke();}
    // bars
    const bw=W/barData.length*.6,gap=W/barData.length;
    barData.forEach((v,i)=>{
      const bh=(v+Math.sin(t+i*.5)*.08)*H*.85;
      const grd=ctx.createLinearGradient(0,H-bh,0,H);
      grd.addColorStop(0,'rgba(255,200,1,0.9)');
      grd.addColorStop(1,'rgba(17,76,90,0.3)');
      ctx.fillStyle=grd;
      ctx.beginPath();
      ctx.roundRect(gap*i+gap*.2,H-bh,bw,bh,3);
      ctx.fill();
    });
    // sine line overlay
    ctx.beginPath();
    ctx.strokeStyle='rgba(255,153,50,0.7)'; ctx.lineWidth=2*devicePixelRatio;
    for(let x=0;x<W;x++){
      const y=H/2-Math.sin(x/W*Math.PI*4+t)*H*.22;
      x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.stroke();
  })();
})();

/* ═══════════════════════════════════════════════
   THREE.JS — FEATURE CARD MINI GLOBE
═══════════════════════════════════════════════ */
(function featureGlobe(){
  const canvas=document.getElementById('featureGlobe');
  if(!canvas||!window.THREE) return;
  const R=THREE;
  const renderer=new R.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0,0);
  const scene=new R.Scene();
  const camera=new R.PerspectiveCamera(50,1,0.1,100);
  camera.position.z=5;
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  resize();window.addEventListener('resize',resize,{passive:true});
  // sphere wireframe
  const sGeo=new R.SphereGeometry(1.8,24,16);
  const sMat=new R.MeshBasicMaterial({color:0x114C5A,wireframe:true,transparent:true,opacity:0.4});
  const sphere=new R.Mesh(sGeo,sMat); scene.add(sphere);
  // node dots on sphere
  const nCount=40;
  for(let i=0;i<nCount;i++){
    const phi=Math.acos(1-2*(i+.5)/nCount),theta=Math.PI*(1+Math.sqrt(5))*i;
    const g=new R.SphereGeometry(.06,6,6);
    const m=new R.MeshBasicMaterial({color:Math.random()<.3?0xFFC801:0x1a8090});
    const mesh=new R.Mesh(g,m);
    mesh.position.set(1.8*Math.sin(phi)*Math.cos(theta),1.8*Math.sin(phi)*Math.sin(theta),1.8*Math.cos(phi));
    scene.add(mesh);
  }
  // outer ring
  const oGeo=new R.TorusGeometry(2.2,.04,8,60);
  const oMat=new R.MeshBasicMaterial({color:0xFFC801,transparent:true,opacity:0.3});
  const outer=new R.Mesh(oGeo,oMat);outer.rotation.x=Math.PI/4;scene.add(outer);
  let t=0;
  (function loop(){requestAnimationFrame(loop);t+=.008;sphere.rotation.y=t;sphere.rotation.x=t*.3;outer.rotation.z=t*.5;renderer.render(scene,camera);})();
})();

/* ═══════════════════════════════════════════════
   THREE.JS — LARGE GLOBE SECTION
═══════════════════════════════════════════════ */
(function bigGlobe(){
  const canvas=document.getElementById('globeCanvas');
  if(!canvas||!window.THREE) return;
  const R=THREE;
  const renderer=new R.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0,0);
  const scene=new R.Scene();
  const camera=new R.PerspectiveCamera(45,1,0.1,200);
  camera.position.set(0,0,8);
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  resize();window.addEventListener('resize',resize,{passive:true});

  // main sphere
  const sGeo=new R.SphereGeometry(2.8,48,32);
  const sMat=new R.MeshBasicMaterial({color:0x0a1e28,wireframe:false});
  scene.add(new R.Mesh(sGeo,sMat));
  // wireframe overlay
  const wGeo=new R.SphereGeometry(2.82,36,24);
  const wMat=new R.MeshBasicMaterial({color:0x114C5A,wireframe:true,transparent:true,opacity:0.35});
  const wire=new R.Mesh(wGeo,wMat); scene.add(wire);

  // latitude/longitude lines
  function addCircle(r,rx,ry){
    const g=new R.TorusGeometry(r,.012,8,120);
    const m=new R.MeshBasicMaterial({color:0x1a5a70,transparent:true,opacity:0.4});
    const mesh=new R.Mesh(g,m);mesh.rotation.x=rx;mesh.rotation.y=ry;scene.add(mesh);
  }
  addCircle(2.82,0,0);addCircle(2.82,Math.PI/2,0);
  addCircle(2.5,Math.PI/4,0);addCircle(2.5,-Math.PI/4,0);

  // glow dots (cities)
  const cities=[[40,74],[51,0],[35,139],[48,2],[1,103],[19,-99],[-34,-58],[55,37]];
  cities.forEach(([lat,lon])=>{
    const phi=(90-lat)*Math.PI/180,theta=(lon+180)*Math.PI/180;
    const x=2.88*Math.sin(phi)*Math.cos(theta),y=2.88*Math.cos(phi),z=2.88*Math.sin(phi)*Math.sin(theta);
    const dg=new R.SphereGeometry(.07,8,8);
    const dm=new R.MeshBasicMaterial({color:0xFFC801});
    const dot=new R.Mesh(dg,dm);dot.position.set(x,y,z);scene.add(dot);
    // halo
    const hg=new R.RingGeometry(.1,.14,16);
    const hm=new R.MeshBasicMaterial({color:0xFFC801,transparent:true,opacity:0.35,side:R.DoubleSide});
    const halo=new R.Mesh(hg,hm);halo.position.set(x,y,z);halo.lookAt(0,0,0);scene.add(halo);
  });

  // outer glow ring
  const ogGeo=new R.TorusGeometry(3.2,.05,8,80);
  const ogMat=new R.MeshBasicMaterial({color:0x114C5A,transparent:true,opacity:0.2});
  const og=new R.Mesh(ogGeo,ogMat);og.rotation.x=.5;scene.add(og);
  const og2=new R.Mesh(new R.TorusGeometry(3.5,.03,8,80),new R.MeshBasicMaterial({color:0xFFC801,transparent:true,opacity:0.1}));
  og2.rotation.x=-.4;og2.rotation.y=.8;scene.add(og2);

  // particles around globe
  const pn=600,pp=new Float32Array(pn*3);
  for(let i=0;i<pn;i++){const r=3.8+Math.random()*2,t2=Math.random()*Math.PI*2,p2=Math.acos(Math.random()*2-1);pp[i*3]=r*Math.sin(p2)*Math.cos(t2);pp[i*3+1]=r*Math.sin(p2)*Math.sin(t2);pp[i*3+2]=r*Math.cos(p2);}
  const pg=new R.BufferGeometry();pg.setAttribute('position',new R.BufferAttribute(pp,3));
  scene.add(new R.Points(pg,new R.PointsMaterial({size:.04,color:0x3a8fa0,transparent:true,opacity:.6})));

  let t=0;
  (function loop(){requestAnimationFrame(loop);t+=.003;wire.rotation.y=t;og.rotation.z=t*.4;og2.rotation.y=t*.3;renderer.render(scene,camera);})();
})();

/* ═══════════════════════════════════════════════
   THREE.JS — WORKFLOW CANVAS: particle flow between steps
═══════════════════════════════════════════════ */
(function wfScene(){
  const canvas=document.getElementById('wfCanvas');
  if(!canvas||!window.THREE) return;
  const R=THREE;
  const renderer=new R.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0,0);
  const scene=new R.Scene();
  const camera=new R.OrthographicCamera(-50,50,-15,15,0.1,100);
  camera.position.z=10;
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);const a=w/h;camera.left=-50*a;camera.right=50*a;camera.updateProjectionMatrix();}
  resize();window.addEventListener('resize',resize,{passive:true});
  // flowing particles along x axis
  const pts=[];
  for(let i=0;i<80;i++){pts.push({x:(Math.random()-.5)*96,y:(Math.random()-.4)*4,z:0,speed:0.15+Math.random()*.25,opacity:Math.random()});}
  const pGeo=new R.BufferGeometry();
  const pPos=new Float32Array(pts.length*3);
  pGeo.setAttribute('position',new R.BufferAttribute(pPos,3));
  const pMat=new R.PointsMaterial({size:.6,color:0xFFC801,transparent:true,opacity:.7});
  scene.add(new R.Points(pGeo,pMat));
  (function loop(){
    requestAnimationFrame(loop);
    pts.forEach((p,i)=>{p.x+=p.speed;if(p.x>48){p.x=-48;}pPos[i*3]=p.x;pPos[i*3+1]=p.y;pPos[i*3+2]=0;});
    pGeo.attributes.position.needsUpdate=true;
    renderer.render(scene,camera);
  })();
})();

/* ═══════════════════════════════════════════════
   THREE.JS — STATS CANVAS: 3D floating rings
═══════════════════════════════════════════════ */
(function statsScene(){
  const canvas=document.getElementById('statsCanvas');
  if(!canvas||!window.THREE) return;
  const R=THREE;
  const renderer=new R.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0,0);
  const scene=new R.Scene();
  const camera=new R.PerspectiveCamera(60,1,0.1,200);
  camera.position.z=40;
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  resize();window.addEventListener('resize',resize,{passive:true});
  const rings=[];
  [[0,0x114C5A,.18],[4,0xFFC801,.12],[-4,0xFF9932,.1],[0,0x1a7090,.15]].forEach(([y,c,o],i)=>{
    const g=new R.TorusGeometry(15+i*6,.2,8,80);
    const m=new R.MeshBasicMaterial({color:c,transparent:true,opacity:o});
    const mesh=new R.Mesh(g,m);mesh.rotation.x=Math.PI/3+i*.4;mesh.position.y=y;
    scene.add(mesh);rings.push({mesh,speed:.003+i*.001});
  });
  // particle field
  const n=500,pp=new Float32Array(n*3),pc=new Float32Array(n*3);
  const cl=[new R.Color(0x114C5A),new R.Color(0xFFC801)];
  for(let i=0;i<n;i++){pp[i*3]=(Math.random()-.5)*80;pp[i*3+1]=(Math.random()-.5)*40;pp[i*3+2]=(Math.random()-.5)*40;const c=cl[Math.floor(Math.random()*cl.length)];pc[i*3]=c.r;pc[i*3+1]=c.g;pc[i*3+2]=c.b;}
  const pg=new R.BufferGeometry();pg.setAttribute('position',new R.BufferAttribute(pp,3));pg.setAttribute('color',new R.BufferAttribute(pc,3));
  scene.add(new R.Points(pg,new R.PointsMaterial({size:.5,vertexColors:true,transparent:true,opacity:.4})));
  let t=0;
  (function loop(){requestAnimationFrame(loop);t+=.01;rings.forEach(r=>{r.mesh.rotation.y+=r.speed;r.mesh.rotation.z+=r.speed*.5;});renderer.render(scene,camera);})();
})();

/* ═══════════════════════════════════════════════
   THREE.JS — CTA CANVAS: spectacular vortex
═══════════════════════════════════════════════ */
(function ctaScene(){
  const canvas=document.getElementById('ctaCanvas');
  if(!canvas||!window.THREE) return;
  canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;';
  const R=THREE;
  const renderer=new R.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0x060e13,1);
  const scene=new R.Scene();
  const camera=new R.PerspectiveCamera(60,1,0.1,500);
  camera.position.z=60;
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  resize();window.addEventListener('resize',resize,{passive:true});
  // vortex helix particles
  const n=1200,pp=new Float32Array(n*3),pc=new Float32Array(n*3);
  const col1=new R.Color(0xFFC801),col2=new R.Color(0x114C5A),col3=new R.Color(0xFF9932);
  for(let i=0;i<n;i++){
    const angle=i/n*Math.PI*20;
    const radius=3+i/n*28;
    const height=(i/n-.5)*60;
    pp[i*3]=Math.cos(angle)*radius+(Math.random()-.5)*4;
    pp[i*3+1]=height+(Math.random()-.5)*3;
    pp[i*3+2]=Math.sin(angle)*radius+(Math.random()-.5)*4;
    const mix=i/n;
    const c=mix<.5?col1.clone().lerp(col2,mix*2):col2.clone().lerp(col3,(mix-.5)*2);
    pc[i*3]=c.r;pc[i*3+1]=c.g;pc[i*3+2]=c.b;
  }
  const pg=new R.BufferGeometry();pg.setAttribute('position',new R.BufferAttribute(pp,3));pg.setAttribute('color',new R.BufferAttribute(pc,3));
  const vortex=new R.Points(pg,new R.PointsMaterial({size:.5,vertexColors:true,transparent:true,opacity:.75}));
  scene.add(vortex);
  // icosahedron
  const ig=new R.IcosahedronGeometry(8,1);
  const im=new R.MeshBasicMaterial({color:0x114C5A,wireframe:true,transparent:true,opacity:0.15});
  const ico=new R.Mesh(ig,im);scene.add(ico);
  let t=0;
  (function loop(){requestAnimationFrame(loop);t+=.008;vortex.rotation.y=t;ico.rotation.x=t*.5;ico.rotation.y=t*.3;renderer.render(scene,camera);})();
})();

/* ═══════════════════════════════════════════════
   3D MOUSE-TILT for bento + test + price cards
═══════════════════════════════════════════════ */
function applyTilt(els,maxDeg){
  els.forEach(el=>{
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      el.style.transform=`perspective(900px) rotateX(${-y*maxDeg}deg) rotateY(${x*maxDeg}deg) translateZ(10px)`;
      el.style.setProperty('--mx',`${(e.clientX-r.left)/r.width*100}%`);
      el.style.setProperty('--my',`${(e.clientY-r.top)/r.height*100}%`);
    });
    el.addEventListener('mouseleave',()=>{el.style.transform='';});
  });
}
applyTilt(document.querySelectorAll('.bc'),14);
applyTilt(document.querySelectorAll('.test-card'),10);

/* dashboard panel 3D tilt */
const dp=document.getElementById('dashPanel');
if(dp){
  const art=document.getElementById('heroArt');
  art.addEventListener('mousemove',e=>{
    const r=art.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    dp.style.transform=`rotateX(${8-y*12}deg) rotateY(${-10+x*14}deg) rotateZ(${-1+x*.5}deg)`;
  });
  art.addEventListener('mouseleave',()=>{dp.style.transform='rotateX(8deg) rotateY(-10deg) rotateZ(-1deg)';});
}

/* ═══════════════════════════════════════════════
   MINI BARS animated in real time
═══════════════════════════════════════════════ */
(function animateBars(){
  const bars=document.querySelectorAll('#miniBars span');
  if(!bars.length) return;
  const targets=[35,55,40,75,60,88];
  setInterval(()=>{
    bars.forEach((b,i)=>{
      const v=targets[i]+Math.floor((Math.random()-.5)*20);
      b.style.height=Math.max(15,Math.min(95,v))+'%';
    });
  },1800);
})();

/* ═══════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════ */
const navbar=document.getElementById('navbar');
window.addEventListener('scroll',()=>navbar.classList.toggle('scrolled',scrollY>40),{passive:true});
const ham=document.getElementById('hamburger'),mob=document.getElementById('mobileMenu');
ham.addEventListener('click',()=>{const o=mob.classList.toggle('open');ham.classList.toggle('active',o);document.body.style.overflow=o?'hidden':'';});
mob.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mob.classList.remove('open');ham.classList.remove('active');document.body.style.overflow='';}));

/* ═══════════════════════════════════════════════
   TRUSTED MARQUEE
═══════════════════════════════════════════════ */
const cos=['Lumina Retail','Forta Health','Northbeam Logistics','Vertex Capital','Cascade Systems','Anvil Robotics','NexGen Labs','Orbit Finance'];
const track=document.getElementById('marqueeTrack');
function chip(n){const s=document.createElement('span');s.className='logo-chip';s.innerHTML=`<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16" aria-hidden="true"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="11" y="1" width="6" height="6" rx="1"/><rect x="1" y="11" width="6" height="6" rx="1"/><rect x="11" y="11" width="6" height="6" rx="1"/></svg>${n}`;return s;}
[...cos,...cos].forEach(n=>track.appendChild(chip(n)));

/* ═══════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════ */
const ro=new IntersectionObserver(e=>{e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');ro.unobserve(x.target);}});},{threshold:.1});
document.querySelectorAll('.bc,.test-card,.wf-step,.stat-card,.faq-item,.s-head.reveal,.reveal').forEach(el=>{el.classList.add('reveal');ro.observe(el);});

/* ═══════════════════════════════════════════════
   FEATURES ACCORDION (mobile)
═══════════════════════════════════════════════ */
const fData=[
  {t:'AI Agent Builder',d:'Design autonomous agents with visual canvas. No orchestration code.',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4"/></svg>'},
  {t:'Workflow Automation',d:'Chain triggers, conditions, and AI steps at any scale.',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h12M3 18h18"/></svg>'},
  {t:'Enterprise Security',d:'SOC 2, SSO, field-level encryption, and audit logs out of the box.',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"/></svg>'},
  {t:'Real-Time Analytics',d:'Live dashboards for every workflow, agent, and data source.',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 16l4-5 3 3 5-7"/></svg>'},
  {t:'Cloud Scalability',d:'Auto-scale infrastructure with no manual provisioning.',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/></svg>'},
  {t:'200+ Integrations',d:'Connect Salesforce, Slack, Jira, Google, and Microsoft 365.',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l5-6 4 3 5-8 4 5"/></svg>'},
];
let activeF=0;
document.querySelectorAll('.bc').forEach(c=>{c.addEventListener('mouseenter',()=>activeF=+c.dataset.feature);c.addEventListener('click',()=>activeF=+c.dataset.feature);});
const accRoot=document.getElementById('accordionFeatures');
function buildAcc(){
  accRoot.innerHTML='';
  fData.forEach((f,i)=>{
    const item=document.createElement('div');item.className='acc-item'+(i===activeF?' active':'');
    item.innerHTML=`<button class="acc-head" aria-expanded="${i===activeF}"><span class="ico">${f.i}</span><h3>${f.t}</h3><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button><div class="acc-panel"><div class="acc-panel-inner">${f.d}</div></div>`;
    item.querySelector('.acc-head').addEventListener('click',()=>{
      const open=item.classList.contains('active');
      accRoot.querySelectorAll('.acc-item').forEach(el=>{el.classList.remove('active');el.querySelector('.acc-head').setAttribute('aria-expanded','false');});
      if(!open){item.classList.add('active');item.querySelector('.acc-head').setAttribute('aria-expanded','true');activeF=i;}
    });
    accRoot.appendChild(item);
  });
}
buildAcc();
window.matchMedia('(max-width:900px)').addEventListener('change',buildAcc);

/* ═══════════════════════════════════════════════
   PRICING
═══════════════════════════════════════════════ */
(function pricing(){
  const pm={Starter:25,Professional:59,Enterprise:129};
  const cur={USD:{r:1,s:'$'},INR:{r:83,s:'₹'},EUR:{r:.92,s:'€'}};
  const disc=.8;
  const meta={
    Starter:{tag:null,tagline:'For small teams starting with AI automation.',feats:['Up to 5 active workflows','1 AI agent','Email + chat support','Standard integrations']},
    Professional:{tag:'MOST POPULAR',tagline:'For teams running AI across departments.',feats:['Unlimited workflows','10 AI agents','Priority support','Advanced integrations','Audit logs']},
    Enterprise:{tag:null,tagline:'For orgs with enterprise security requirements.',feats:['Unlimited everything','Unlimited AI agents','Dedicated success manager','SSO & field-level encryption','Custom SLA']},
  };
  let cycle='monthly',currency='USD';
  const grid=document.getElementById('priceGrid');
  const bM=document.getElementById('btnMonthly'),bA=document.getElementById('btnAnnual'),cS=document.getElementById('currencySelect');

  function render(){
    grid.innerHTML='';
    Object.keys(pm).forEach(plan=>{
      const v=pm[plan]*cur[currency].r*(cycle==='annual'?disc:1);
      const fmt=currency==='INR'?Math.round(v).toLocaleString():v%1===0?v.toLocaleString():v.toFixed(2);
      const m=meta[plan];
      const card=document.createElement('article');card.className='price-card'+(plan==='Professional'?' featured':'');
      card.innerHTML=`
        ${m.tag?`<div class="pc-badge">${m.tag}</div>`:''}
        <h3>${plan}</h3>
        <p class="pc-tagline">${m.tagline}</p>
        <div style="margin-bottom:6px"><span class="pc-amount"><span class="pc-symbol">${cur[currency].s}${currency==='INR'?' ':''}</span>${fmt}</span></div>
        <p class="pc-cycle">/ ${cycle==='monthly'?'month':'month, billed annually'}</p>
        <p class="pc-note">${cycle==='annual'?'20% saved vs monthly':'Cancel anytime'}</p>
        <ul>${m.feats.map(f=>`<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>${f}</li>`).join('')}</ul>
        <a href="#" class="btn ${plan==='Professional'?'btn-primary':'btn-ghost'}">Start Free Trial</a>
      `;
      applyTilt([card],10);
      grid.appendChild(card);
    });
  }
  bM.addEventListener('click',()=>{if(cycle==='monthly')return;cycle='monthly';bM.classList.add('active');bA.classList.remove('active');render();});
  bA.addEventListener('click',()=>{if(cycle==='annual')return;cycle='annual';bA.classList.add('active');bM.classList.remove('active');render();});
  cS.addEventListener('change',e=>{currency=e.target.value;render();});
  render();
})();

/* ═══════════════════════════════════════════════
   STATS COUNT-UP
═══════════════════════════════════════════════ */
const stObs=new IntersectionObserver(e=>{e.forEach(x=>{if(x.isIntersecting){countUp(x.target);stObs.unobserve(x.target);}});},{threshold:.5});
document.querySelectorAll('.count').forEach(c=>stObs.observe(c));
function countUp(el){
  const target=parseFloat(el.dataset.target),dec=parseInt(el.dataset.dec||'0');
  const dur=1600,start=performance.now();
  (function tick(now){
    const p=Math.min((now-start)/dur,1),e2=1-Math.pow(1-p,3),v=target*e2;
    el.textContent=dec?v.toFixed(dec):Math.round(v).toLocaleString();
    if(p<1) requestAnimationFrame(tick);
  })(performance.now());
}

/* ═══════════════════════════════════════════════
   FAQ
═══════════════════════════════════════════════ */
document.querySelectorAll('.faq-item').forEach(item=>{
  const q=item.querySelector('.faq-q'),a=item.querySelector('.faq-a');
  q.addEventListener('click',()=>{
    const open=item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(o=>{o.classList.remove('open');o.querySelector('.faq-q').setAttribute('aria-expanded','false');o.querySelector('.faq-a').style.maxHeight=null;});
    if(!open){item.classList.add('open');q.setAttribute('aria-expanded','true');a.style.maxHeight=a.scrollHeight+'px';}
  });
});

/* ═══════════════════════════════════════════════
   3D TESTIMONIALS SYSTEM
═══════════════════════════════════════════════ */
(function testimonials3D(){
  const tData = [
    {
      name: 'Sarah Jenkins',
      role: 'VP of Operations, Aetna',
      country: '🇺🇸 USA',
      img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face',
      body: 'We migrated 400 linear workflow tasks onto NeuroFlow. The execution speeds are outstanding and pricing is highly flexible.'
    },
    {
      name: 'Marcus Vance',
      role: 'Lead Architect, IBM Cloud',
      country: '🇬🇧 UK',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
      body: 'The Bento-to-Accordion layout transition is beautifully fluid on mobile. Our engineers monitor workflows on-the-go without friction.'
    },
    {
      name: 'David Chen',
      role: 'Director of Security, OpenAI',
      country: '🇸🇬 Singapore',
      img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=64&h=64&fit=crop&crop=face',
      body: 'ISO-level security isolation keeps our data structures highly compliant. This platform sets the standard for modern AI automation.'
    },
    {
      name: 'Priya Nair',
      role: 'Head of Data, Razorpay',
      country: '🇮🇳 India',
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face',
      body: 'NeuroFlow cut our data pipeline overhead by 60%. The analytics dashboard alone justifies the entire investment.'
    },
    {
      name: 'Lucas Moreau',
      role: 'CTO, Luminar Labs',
      country: '🇫🇷 France',
      img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face',
      body: 'Buttery smooth animations and incredibly fast cold starts. NeuroFlow makes every interaction feel premium.'
    },
    {
      name: 'Aiko Tanaka',
      role: 'Product Manager, Sony Tech',
      country: '🇯🇵 Japan',
      img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
      body: 'The intelligent routing engine alone saved us weeks of custom integration work. Highly recommended for any enterprise.'
    },
    {
      name: 'Carlos Reyes',
      role: 'Engineering Lead, Mango Digital',
      country: '🇪🇸 Spain',
      img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
      body: 'We replaced 3 separate automation tools with NeuroFlow. The unified interface is a game changer for our ops team.'
    },
    {
      name: 'Emma Fischer',
      role: 'Growth Lead, Tier Mobility',
      country: '🇩🇪 Germany',
      img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=64&h=64&fit=crop&crop=face',
      body: 'The pause-on-hover marquee and rich scroll animations make our demos irresistible to prospects. Conversion up 38%.'
    },
    {
      name: 'James Okafor',
      role: 'Platform Engineer, Flutterwave',
      country: '🇳🇬 Nigeria',
      img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop&crop=face',
      body: 'Real-time orchestration across 12 microservices with zero downtime upgrades. NeuroFlow is production-grade AI.'
    }
  ];

  const colMapping = [
    [0, 1, 2, 3, 0, 1, 2, 3], // Col 1 (down)
    [4, 5, 6, 7, 4, 5, 6, 7], // Col 2 (up)
    [8, 0, 1, 2, 8, 0, 1, 2], // Col 3 (down)
    [3, 4, 5, 6, 3, 4, 5, 6]  // Col 4 (up)
  ];

  const board = document.getElementById('testimonialsBoard');
  const container = document.getElementById('testimonialsContainer');
  if (!board || !container) return;

  function render(){
    board.innerHTML = '';
    colMapping.forEach((indices, colIdx) => {
      const colDiv = document.createElement('div');
      colDiv.className = 'test-marquee-col';
      const isReverse = colIdx % 2 === 1;
      const durations = ['38s', '42s', '36s', '44s'];
      colDiv.style.setProperty('--duration', durations[colIdx]);
      
      const trackDiv = document.createElement('div');
      trackDiv.className = 'test-marquee-track' + (isReverse ? ' reverse' : '');
      
      indices.forEach(idx => {
        const item = tData[idx];
        const card = document.createElement('article');
        card.className = 'test-card-3d';
        card.innerHTML = `
          <div class="inner-avatar-row">
            <div class="test-avatar-img">
              <img src="${item.img}" alt="${item.name}" loading="lazy">
            </div>
            <div class="test-details">
              <figcaption class="test-name">${item.name}<span style="font-size:10px;margin-left:4px;">${item.country}</span></figcaption>
              <p class="test-role">${item.role}</p>
            </div>
          </div>
          <blockquote class="inner-body">&ldquo;${item.body}&rdquo;</blockquote>
        `;
        trackDiv.appendChild(card);
      });
      
      colDiv.appendChild(trackDiv);
      board.appendChild(colDiv);
    });
  }

  render();

  // Mouse tilt handlers
  container.addEventListener('mousemove', e => {
    const rect = container.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    
    const rotX = 18 - ny * 6; // 12deg to 24deg
    const rotY = -8 + nx * 8; // -16deg to 0deg
    
    board.style.transform = `translateX(-80px) translateY(0px) translateZ(-80px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(18deg)`;
  });

  container.addEventListener('mouseleave', () => {
    board.style.transform = 'translateX(-80px) translateY(0px) translateZ(-80px) rotateX(18deg) rotateY(-8deg) rotateZ(18deg)';
  });
})();

/* ═══════════════════════════════════════════════
   3D WORKFLOW BOARD TILT
═══════════════════════════════════════════════ */
(function workflow3D(){
  const wrap = document.querySelector('.workflow-wrap');
  const scene = document.getElementById('wfScene');
  if(!wrap || !scene) return;

  wrap.addEventListener('mousemove', e => {
    const rect = wrap.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    
    // Baseline: rotateX(0deg) rotateY(0deg) rotateZ(0deg)
    const rotX = ny * 8; // range -8deg to 8deg
    const rotY = nx * 8; // range -8deg to 8deg
    
    scene.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(0deg)`;
  });

  wrap.addEventListener('mouseleave', () => {
    scene.style.transform = 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
  });
})();

})();