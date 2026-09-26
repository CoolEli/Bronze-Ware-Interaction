import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CONFIG, PIXEL_RATIO } from './config.js';
import { state, toast } from './state.js';
import { DICT } from './config.js';

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(CONFIG.CAMERA.fov, innerWidth / innerHeight, CONFIG.CAMERA.near, CONFIG.CAMERA.far);
camera.position.set(0, 0.5, CONFIG.CAMERA.defaultZ);
export const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', alpha: false });
renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(PIXEL_RATIO); renderer.setClearColor(0x020305, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
document.body.appendChild(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
scene.environment = environment.texture;
pmrem.dispose();
scene.add(new THREE.DirectionalLight(0xffeedd, 3).translateX(5));
scene.children[scene.children.length - 1].position.set(5, 8, 5);
const fillLight = new THREE.DirectionalLight(0x88bbff, 1.2); fillLight.position.set(-5, -2, -5); scene.add(fillLight);

export const composer = new EffectComposer(renderer);
composer.setSize(innerWidth, innerHeight); composer.addPass(new RenderPass(scene, camera));
export const bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.45, 0.5, 0.6);
composer.addPass(bloomPass); composer.addPass(new OutputPass());
export const clock = new THREE.Clock();

export const cursorGroup = new THREE.Group();
cursorGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff })));
export const cursorRing = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.16, 32), new THREE.MeshBasicMaterial({ color: 0xd8b56a, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
cursorGroup.add(cursorRing); cursorGroup.visible = false; scene.add(cursorGroup);

renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); state.isPaused = true; toast(DICT[state.lang].toast_context_lost, 'error'); });
renderer.domElement.addEventListener('webglcontextrestored', () => { state.isPaused = false; toast(DICT[state.lang].toast_context_restored); window.dispatchEvent(new CustomEvent('bronze:context-restored')); });

export function resizeScene() {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
}

export function disposeScene() {
  renderer.dispose(); composer.dispose(); scene.traverse(object => { object.geometry?.dispose?.(); object.material?.dispose?.(); });
}
