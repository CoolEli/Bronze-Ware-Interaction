import * as THREE from 'three';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CONFIG, COUNT } from './config.js';
import { scene } from './scene.js';
import { state, setLoading, toast } from './state.js';

export const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);

function leakShader(material) {
  return shader => {
    shader.uniforms.uMousePos = { value: new THREE.Vector3(9999, 9999, 9999) };
    shader.uniforms.uLeakRadius = { value: 0 };
    shader.uniforms.uStateBlend = { value: 0 };
    shader.uniforms.uTransitionAlpha = { value: 1 };
    material.userData.shader = shader;
    shader.vertexShader = `varying vec3 vWorldPos_custom;\n${shader.vertexShader}`.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWorldPos_custom=(modelMatrix*vec4(transformed,1.)).xyz;');
    shader.fragmentShader = `uniform vec3 uMousePos;uniform float uLeakRadius;uniform float uStateBlend;uniform float uTransitionAlpha;varying vec3 vWorldPos_custom;\n${shader.fragmentShader}`.replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.a*=uStateBlend*uTransitionAlpha;if(uLeakRadius>0.&&uStateBlend>.1){float d=length(vWorldPos_custom-uMousePos);if(d<uLeakRadius){float inner=uLeakRadius*.8;if(d<inner)discard;float t=(d-inner)/(uLeakRadius-inner);float glow=sin(t*3.1415926);gl_FragColor.rgb+=mix(vec3(3.,.2,0.),vec3(3.,1.5,.2),glow)*glow*1.8;gl_FragColor.a*=smoothstep(0.,.5,t);}}');
  };
}

function processMaterial(material) {
  const clone = material.clone(); clone.transparent = true; clone.depthWrite = true; clone.depthTest = true; clone.alphaTest = .02; clone.envMapIntensity = 1.2; clone.side = THREE.FrontSide; clone.onBeforeCompile = leakShader(clone); clone.needsUpdate = true; return clone;
}

const yieldToBrowser = () => new Promise(resolve => requestAnimationFrame(resolve));

export async function processModel(model, count = COUNT) {
  model.updateMatrixWorld(true); const triangles = [];
  model.traverse(object => { if (!object.isMesh || !object.geometry?.attributes?.position) return; const geometry = object.geometry; const positions = geometry.attributes.position; const vertices = []; const point = new THREE.Vector3(); for (let i=0;i<positions.count;i++) vertices.push(point.fromBufferAttribute(positions,i).applyMatrix4(object.matrixWorld).clone()); const index = geometry.index; if (index) for(let i=0;i<index.count;i+=3) triangles.push({p:[vertices[index.getX(i)],vertices[index.getX(i+1)],vertices[index.getX(i+2)]]}); else for(let i=0;i+2<vertices.length;i+=3) triangles.push({p:[vertices[i],vertices[i+1],vertices[i+2]]}); });
  const cumulative = new Float64Array(triangles.length); let totalArea = 0; const a=new THREE.Vector3(),b=new THREE.Vector3(),cross=new THREE.Vector3(); for(let i=0;i<triangles.length;i++){a.subVectors(triangles[i].p[1],triangles[i].p[0]);b.subVectors(triangles[i].p[2],triangles[i].p[0]);totalArea+=cross.crossVectors(a,b).length()*.5;cumulative[i]=totalArea;} if(!triangles.length||!totalArea) throw new Error('Model has no renderable triangles');
  const box = new THREE.Box3(); triangles.forEach(t=>t.p.forEach(p=>box.expandByPoint(p))); const center=box.getCenter(new THREE.Vector3()); const size=box.getSize(new THREE.Vector3()); const scale=3.5/(Math.max(size.x,size.y,size.z)||1); const positions=new Float32Array(count*3); const sample=new THREE.Vector3();
  for(let i=0;i<count;i++){let r=Math.random()*totalArea,low=0,high=triangles.length-1;while(low<high){const mid=(low+high)>>1;if(r<=cumulative[mid])high=mid;else low=mid+1;}let u=Math.random(),v=Math.random();if(u+v>1){u=1-u;v=1-v;}const w=1-u-v;sample.copy(triangles[low].p[0]).multiplyScalar(w).addScaledVector(triangles[low].p[1],u).addScaledVector(triangles[low].p[2],v).sub(center).multiplyScalar(scale);positions[i*3]=sample.x;positions[i*3+1]=sample.y;positions[i*3+2]=sample.z;if(i>0&&i%8192===0)await yieldToBrowser();}
  const cloned=model.clone(); cloned.position.set(-center.x*scale,-center.y*scale,-center.z*scale); cloned.scale.setScalar(scale); cloned.traverse(object=>{if(object.isMesh&&object.material)object.material=Array.isArray(object.material)?object.material.map(processMaterial):processMaterial(object.material);}); const wrapper=new THREE.Group(); wrapper.add(cloned); wrapper.visible=true; scene.add(wrapper); return {positions,solidWrapper:wrapper};
}

export async function loadModel(index) {
  if (state.modelReady[index]) return true;
  if (state.modelLoading.has(index)) return state.modelLoading.get(index);
  const promise=(async()=>{setLoading(`${index ? 'LOADING MODEL' : 'LOADING PRIMARY MODEL'} ${index+1}/${CONFIG.MODELS.length}`);const url=CONFIG.BASE_URL+CONFIG.MODELS[index];const timer=new Promise((_,reject)=>setTimeout(()=>reject(new Error('Model loading timeout')),CONFIG.LOAD_TIMEOUT_MS));const gltf=await Promise.race([loader.loadAsync(url),timer]);const result=await processModel(gltf.scene,COUNT);state.modelTargets[index]={positions:result.positions};state.solidModels[index]=result.solidWrapper;state.modelReady[index]=true;return true;})().catch(error=>{toast(`${error.message}`,'error',5000);return false;}).finally(()=>state.modelLoading.delete(index));state.modelLoading.set(index,promise);return promise;
}

export function switchModel(index, setTargets) { if(index===state.currentIndex||!state.modelReady[index])return false;setTargets(state.modelTargets[index].positions);state.prevIndex=state.currentIndex;state.currentIndex=index;state.transition=0;return true; }
export function nextModel(setTargets) { for(let step=1;step<=CONFIG.MODELS.length;step++){const index=(state.currentIndex+step)%CONFIG.MODELS.length;if(state.modelReady[index])return switchModel(index,setTargets);}toast('MODEL NOT LOADED YET','error');return false; }

export function disposeModels() { state.solidModels.forEach(model=>model?.traverse(object=>{if(object.isMesh){object.geometry?.dispose?.();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>{material?.map?.dispose?.();material?.normalMap?.dispose?.();material?.dispose?.();});}})); }
