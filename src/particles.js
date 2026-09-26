import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';
import { COUNT, WIDTH, PIXEL_RATIO, CONFIG } from './config.js';
import { scene, renderer } from './scene.js';

const velocityShader = `
precision highp float;
uniform float uTime; uniform float uDelta; uniform float uGather; uniform float uExplosion;
uniform vec3 uMousePos; uniform vec3 uMouseVel; uniform float uMouseActive; uniform float uLeakRadius;
uniform sampler2D uTargetA; uniform sampler2D uTargetB; uniform float uTransition; uniform sampler2D uTextureTrail;
vec3 hash33(vec3 p){p=fract(p*vec3(.1031,.1030,.0973));p+=dot(p,p.yxz+33.33);return fract((p.xxy+p.yxx)*p.zyx);}
void main(){vec2 uv=gl_FragCoord.xy/resolution.xy;vec3 pos=texture2D(texturePosition,uv).xyz;vec3 vel=texture2D(textureVelocity,uv).xyz;vec3 target=mix(texture2D(uTargetA,uv).xyz,texture2D(uTargetB,uv).xyz,uTransition);float trail=texture2D(uTextureTrail,uv).r;float distToMouse=length(pos-uMousePos);float radius=max(uLeakRadius,.8);float leaking=(uMouseActive>0.0&&distToMouse<radius)?1.0:0.0;float leakState=max(leaking,smoothstep(.3,.8,trail)*.95);if(uTransition<1.0)leakState=0.0;float structure=uGather*(1.0-uExplosion)*(1.0-leakState);vec3 spring=(target-pos)*28.0*structure;vec3 orbit=normalize(cross(pos,vec3(0.,1.,0.))+vec3(.001))*25.0*(1.0-uGather);vec3 explode=vec3(0.);if(uExplosion>0.){vec3 dir=hash33(pos*10.)*2.-1.;explode=normalize(pos+dir)*75.*uExplosion/(length(pos)+.1);}vec3 spark=vec3(0.);if(leaking>0.){vec3 dir=normalize(pos-uMousePos+hash33(pos*5.)*.5);float strength=1.-distToMouse/radius;spark=dir*35.*strength+vec3(0.,3.,0.)+uMouseVel*.15;}vel+=(spring+orbit+explode+spark+vec3(0.,-8.,0.)*(1.-structure))*uDelta;vel*=mix(.98,.72,structure);if(length(vel)>40.)vel=normalize(vel)*40.;gl_FragColor=vec4(vel,1.);}`;
const positionShader = `precision highp float;uniform float uDelta;void main(){vec2 uv=gl_FragCoord.xy/resolution.xy;gl_FragColor=vec4(texture2D(texturePosition,uv).xyz+texture2D(textureVelocity,uv).xyz*uDelta,1.);}`;
const trailShader = `precision highp float;uniform float uDelta;void main(){vec2 uv=gl_FragCoord.xy/resolution.xy;float trail=texture2D(textureTrail,uv).r*pow(.85,uDelta*60.);float speed=length(texture2D(textureVelocity,uv).xyz);gl_FragColor=vec4(clamp(trail+smoothstep(1.5,12.,speed)*uDelta*3.,0.,1.2),0.,0.,1.);}`;
const vertexShader = `precision highp float;uniform sampler2D uTexturePosition;uniform sampler2D uTextureVelocity;uniform sampler2D uTextureTrail;uniform float uPixelRatio;uniform float uRefDist;attribute vec2 reference;attribute float aRandom;varying float vSpeed;varying float vTrail;varying float vRandom;void main(){vec3 pos=texture2D(uTexturePosition,reference).xyz;vec3 vel=texture2D(uTextureVelocity,reference).xyz;float trail=texture2D(uTextureTrail,reference).r;float speed=length(vel);vSpeed=speed;vTrail=trail;vRandom=aRandom;vec4 mv=modelViewMatrix*vec4(pos,1.);gl_Position=projectionMatrix*mv;float depth=clamp(uRefDist/max(-mv.z,.1),.4,2.5);gl_PointSize=clamp((1.5+trail*2.5)/(1.+speed*.03)*uPixelRatio*depth*(16./max(-mv.z,.1)),.5,6.);}`;
const fragmentShader = `precision highp float;uniform float uGather;uniform float uStateBlend;varying float vSpeed;varying float vTrail;varying float vRandom;vec3 hsv2rgb(vec3 c){vec4 K=vec4(1.,2./3.,1./3.,3.);vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);}void main(){vec2 p=gl_PointCoord*2.-1.;float r2=dot(p,p);if(r2>1.)discard;float soft=1.-smoothstep(.05,1.,r2);float glow=1.-uGather;float activeMask=clamp((vSpeed-1.)*.8+vTrail*1.5,0.,1.)*pow(uGather,6.);float baseHue=mix(mix(.12,.45,step(.5,fract(vRandom*17.37))),.05+fract(vRandom*10.)*.05,uStateBlend*activeMask);float sat=1.-smoothstep(5.,15.,vSpeed)-glow*.5;float val=.2+smoothstep(2.,10.,vSpeed)*.8+vTrail*.5+glow*1.2;vec3 color=hsv2rgb(vec3(baseHue,sat,val));float alpha=soft*(.1+vTrail*.6+vSpeed*.1+glow*.3)*mix(1.,activeMask,uStateBlend);if(alpha<.03)discard;gl_FragColor=vec4(color,clamp(alpha,0.,.9));}`;

let gpuCompute, positionVariable, velocityVariable, trailVariable, particleMaterial, points, targetA, targetB;
export let gpuAvailable = false;

function dataTexture(data) { const texture = new THREE.DataTexture(data, WIDTH, WIDTH, THREE.RGBAFormat, THREE.FloatType); texture.needsUpdate = true; texture.minFilter = THREE.NearestFilter; texture.magFilter = THREE.NearestFilter; return texture; }
export function writeTargetTexture(texture, positions) { const data = texture.image.data; for (let i = 0; i < COUNT; i++) { data[i * 4] = positions[i * 3]; data[i * 4 + 1] = positions[i * 3 + 1]; data[i * 4 + 2] = positions[i * 3 + 2]; data[i * 4 + 3] = 1; } texture.needsUpdate = true; }
export function setParticleTargets(positions) { if (targetA && targetB) { writeTargetTexture(targetA, positions); writeTargetTexture(targetB, positions); } }

export function initGPU(initialPositions) {
  gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);
  if (renderer.capabilities.isWebGL2) gpuCompute.setDataType(THREE.FloatType);
  const pos0 = gpuCompute.createTexture(); const vel0 = gpuCompute.createTexture(); const trail0 = gpuCompute.createTexture();
  for (let i = 0; i < COUNT; i++) { const r = 20 + Math.random() * 40, theta = Math.random() * Math.PI * 2, phi = Math.acos(2 * Math.random() - 1); pos0.image.data[i*4] = r*Math.sin(phi)*Math.cos(theta); pos0.image.data[i*4+1] = r*Math.cos(phi); pos0.image.data[i*4+2] = r*Math.sin(phi)*Math.sin(theta); pos0.image.data[i*4+3] = 1; }
  vel0.image.data.fill(0); trail0.image.data.fill(0);
  targetA = dataTexture(new Float32Array(COUNT * 4)); targetB = dataTexture(new Float32Array(COUNT * 4)); writeTargetTexture(targetA, initialPositions); writeTargetTexture(targetB, initialPositions);
  positionVariable = gpuCompute.addVariable('texturePosition', positionShader, pos0); velocityVariable = gpuCompute.addVariable('textureVelocity', velocityShader, vel0); trailVariable = gpuCompute.addVariable('textureTrail', trailShader, trail0);
  gpuCompute.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]); gpuCompute.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable, trailVariable]); gpuCompute.setVariableDependencies(trailVariable, [positionVariable, velocityVariable, trailVariable]);
  velocityVariable.material.uniforms = { uTime:{value:0},uDelta:{value:.016},uGather:{value:.78},uExplosion:{value:0},uMousePos:{value:new THREE.Vector3()},uMouseVel:{value:new THREE.Vector3()},uMouseActive:{value:0},uLeakRadius:{value:0},uTargetA:{value:targetA},uTargetB:{value:targetB},uTransition:{value:1},uTextureTrail:{value:null} };
  positionVariable.material.uniforms = { uDelta:{value:.016} }; trailVariable.material.uniforms = { uDelta:{value:.016} };
  const error = gpuCompute.init(); if (error) throw new Error(error);
  const geometry = new THREE.BufferGeometry(); const refs = new Float32Array(COUNT * 2); const randoms = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) { refs[i*2] = ((i % WIDTH) + .5) / WIDTH; refs[i*2+1] = (Math.floor(i / WIDTH) + .5) / WIDTH; randoms[i] = Math.random(); }
  geometry.setAttribute('reference', new THREE.BufferAttribute(refs, 2)); geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1)); geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
  particleMaterial = new THREE.ShaderMaterial({ uniforms:{uTexturePosition:{value:null},uTextureVelocity:{value:null},uTextureTrail:{value:null},uPixelRatio:{value:PIXEL_RATIO},uRefDist:{value:CONFIG.REF_DIST},uGather:{value:.78},uStateBlend:{value:0}}, vertexShader, fragmentShader, transparent:true, depthWrite:false, depthTest:true, blending:THREE.AdditiveBlending });
  points = new THREE.Points(geometry, particleMaterial); scene.add(points); gpuAvailable = true; return points;
}

export function updateParticles(dt, time, params) {
  if (!gpuAvailable) return;
  velocityVariable.material.uniforms.uTextureTrail.value = gpuCompute.getCurrentRenderTarget(trailVariable).texture; velocityVariable.material.uniforms.uDelta.value = dt; velocityVariable.material.uniforms.uTime.value = time; velocityVariable.material.uniforms.uGather.value = params.gather; velocityVariable.material.uniforms.uExplosion.value = params.explosion; velocityVariable.material.uniforms.uMouseActive.value = params.mouseActive; velocityVariable.material.uniforms.uLeakRadius.value = params.leakRadius; velocityVariable.material.uniforms.uTransition.value = params.transition;
  velocityVariable.material.uniforms.uMousePos.value.copy(params.mousePos); velocityVariable.material.uniforms.uMouseVel.value.copy(params.mouseVelocity); positionVariable.material.uniforms.uDelta.value = dt; trailVariable.material.uniforms.uDelta.value = dt; gpuCompute.compute();
  particleMaterial.uniforms.uTexturePosition.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture; particleMaterial.uniforms.uTextureVelocity.value = gpuCompute.getCurrentRenderTarget(velocityVariable).texture; particleMaterial.uniforms.uTextureTrail.value = gpuCompute.getCurrentRenderTarget(trailVariable).texture; particleMaterial.uniforms.uGather.value = params.gather; particleMaterial.uniforms.uStateBlend.value = params.stateBlend;
}
export function rotateParticles(y, x) { if (points) { points.rotation.y = y; points.rotation.x = x; } }
export function getParticleObject() { return points; }
export function disposeParticles() { if (points) { scene.remove(points); points.geometry.dispose(); particleMaterial.dispose(); } [targetA,targetB].forEach(t=>t?.dispose?.()); gpuCompute?.dispose?.(); gpuCompute=null; gpuAvailable=false; }
