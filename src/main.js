import * as THREE from 'three';
import { CONFIG, DICT, COUNT } from './config.js';
import { state, $, dom, mouse, prevMousePos, currentMousePos, localMousePos, mouseVelocity, lastX, lastY, mouseForceActive, toast, setLoading, hideLoading, updateUI, updateButtonStates, setPointerPosition, setLastPointer, setMouseForce } from './state.js';
import { scene, camera, composer, bloomPass, clock, cursorGroup, cursorRing, renderer, resizeScene } from './scene.js';
import { initGPU, updateParticles, setParticleTargets, getParticleObject } from './particles.js';
import { loadModel, nextModel, disposeModels } from './models.js';
import { processHands, toggleGesture, stopGesture } from './gesture.js';

state.modelTargets = new Array(CONFIG.MODELS.length).fill(null);
state.solidModels = new Array(CONFIG.MODELS.length).fill(null);
state.modelReady = new Array(CONFIG.MODELS.length).fill(false);

let animationStarted = false;
let animationFrame = 0;
const raycaster = new THREE.Raycaster();
const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

function setViewMode(mode = state.viewMode === 'particle' ? 'solid' : 'particle') {
  state.viewMode = mode;
  state.targetStateBlend = mode === 'solid' ? 1 : 0;
  state.explosion = mode === 'particle' ? Math.max(state.explosion, .22) : 0;
  updateButtonStates();
}

let fadeTimer = null;
function fadeAudio(target, duration = 400) {
  clearInterval(fadeTimer); const start = dom.bgMusic.volume; const started = performance.now();
  fadeTimer = setInterval(() => { const t = Math.min((performance.now() - started) / duration, 1); dom.bgMusic.volume = start + (target - start) * t; if (t >= 1) clearInterval(fadeTimer); }, 16);
}
async function toggleMusic() {
  if (state.musicPlaying) { fadeAudio(0); setTimeout(() => dom.bgMusic.pause(), 400); state.musicPlaying = false; }
  else { if (!dom.bgMusic.src) { dom.bgMusic.src = CONFIG.BASE_URL + CONFIG.MUSIC_URL; dom.bgMusic.load(); } dom.bgMusic.volume = 0; try { await dom.bgMusic.play(); fadeAudio(CONFIG.MUSIC_VOLUME); state.musicPlaying = true; } catch { toast(DICT[state.lang].toast_audio_blocked, 'error'); } }
  updateUI(); updateButtonStates();
}

function setTargets(positions) { setParticleTargets(positions); }
function nextReadyModel() { nextModel(setTargets); updateUI(); }

function createFallbackPositions(count) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const radius = 2.5 + Math.random() * 2.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  return positions;
}

$('btn-zh').onclick = () => { state.lang = 'zh'; updateUI(); updateButtonStates(); };
$('btn-en').onclick = () => { state.lang = 'en'; updateUI(); updateButtonStates(); };
$('btn-particle').onclick = () => setViewMode('particle');
$('btn-solid').onclick = () => setViewMode('solid');
$('btn-input').onclick = toggleGesture;
$('btn-music').onclick = toggleMusic;
$('btn-ui').onclick = () => { state.uiVisible = !state.uiVisible; dom.uiLayer.style.opacity = state.uiVisible ? '1' : '0'; updateUI(); };

addEventListener('pointerdown', event => { if (state.inputMode === 'gesture' || event.target.tagName === 'BUTTON') return; state.isDragging = true; state.hasDragged = false; setLastPointer(event.clientX, event.clientY); });
addEventListener('pointermove', event => { if (state.inputMode === 'gesture') return; setPointerPosition(event.clientX / innerWidth * 2 - 1, -(event.clientY / innerHeight * 2 - 1)); setMouseForce(1); if (state.isDragging) { state.hasDragged = true; state.userRotY += (event.clientX - lastX) * .006; state.userRotX = Math.max(-.8, Math.min(.8, state.userRotX + (event.clientY - lastY) * .006)); setLastPointer(event.clientX, event.clientY); } });
addEventListener('pointerup', () => { if (state.inputMode === 'gesture') return; if (state.isDragging && !state.hasDragged) state.explosion = 1; state.isDragging = false; });
addEventListener('pointerleave', () => { if (state.inputMode === 'mouse') { setMouseForce(0); state.isDragging = false; } });
addEventListener('wheel', event => { if (state.inputMode !== 'mouse') return; event.preventDefault(); camera.position.z = Math.max(CONFIG.CAMERA.minZ, Math.min(CONFIG.CAMERA.maxZ, camera.position.z + event.deltaY * .01)); }, { passive: false });
addEventListener('keydown', event => { if (event.code === 'Space') { event.preventDefault(); nextReadyModel(); } });
addEventListener('resize', resizeScene);
document.addEventListener('visibilitychange', () => { state.isPaused = document.hidden; if (!state.isPaused) clock.getDelta(); });

function animate() {
  animationFrame = requestAnimationFrame(animate); if (state.isPaused) return;
  const dt = Math.min(clock.getDelta(), .03); const time = clock.elapsedTime;
  if (state.inputMode === 'gesture') processHands(time, dt, nextReadyModel, () => setViewMode());
  raycaster.setFromCamera(mouse, camera); const active = state.solidModels[state.currentIndex]; let hit = false;
  if (active?.visible) { const hits = raycaster.intersectObject(active, true); if (hits.length) { currentMousePos.copy(hits[0].point); hit = true; } }
  if (!hit) raycaster.ray.intersectPlane(mousePlane, currentMousePos);
  if (mouseForceActive) { mouseVelocity.subVectors(currentMousePos, prevMousePos).divideScalar(dt); if (mouseVelocity.length() > 50) mouseVelocity.normalize().multiplyScalar(50); } else mouseVelocity.set(0, 0, 0); prevMousePos.copy(currentMousePos);
  const points = getParticleObject(); if (points) localMousePos.copy(currentMousePos).applyMatrix4(new THREE.Matrix4().copy(points.matrixWorld).invert());
  if (state.inputMode === 'gesture' && mouseForceActive) { cursorGroup.visible = true; cursorGroup.position.copy(currentMousePos); cursorGroup.quaternion.copy(camera.quaternion); cursorRing.rotation.z -= dt * 3; const pulse = 1 + Math.sin(time * 8) * .15; cursorRing.scale.set(pulse, pulse, pulse); cursorRing.material.color.setHex(state.isDragging ? 0xff3333 : 0xd8b56a); } else cursorGroup.visible = false;
  state.stateBlend += (state.targetStateBlend - state.stateBlend) * Math.min(1, dt * 3.5); state.currentLeakRadius += (((state.targetStateBlend > .5 && mouseForceActive) ? .8 : 0) - state.currentLeakRadius) * dt * 8; if (state.transition < 1) state.transition = Math.min(1, state.transition + dt * 1.5); if (state.explosion > 0) state.explosion = Math.max(0, state.explosion - dt * 4);
  updateParticles(dt, time, { gather: state.transition, explosion: state.explosion, mouseActive: mouseForceActive, leakRadius: state.currentLeakRadius, transition: state.transition, stateBlend: state.stateBlend, mousePos: localMousePos, mouseVelocity });
  bloomPass.strength = .4 + state.explosion * .15; state.autoRotateAngle += .002 * (state.isDragging ? 0 : 1); const ry = state.autoRotateAngle + state.userRotY; const rx = state.userRotX; if (points) { points.rotation.y = ry; points.rotation.x = rx; }
  state.solidModels.forEach((model, index) => { if (!model) return; const alpha = index === state.currentIndex ? state.transition : index === state.prevIndex ? 1 - state.transition : 0; model.visible = alpha > .01 && state.stateBlend > .01; if (model.visible) { model.rotation.y = ry; model.rotation.x = rx; model.traverse(child => { if (!child.isMesh) return; const materials = Array.isArray(child.material) ? child.material : [child.material]; materials.forEach(material => { const shader = material.userData?.shader; if (shader) { shader.uniforms.uMousePos.value.copy(currentMousePos); shader.uniforms.uLeakRadius.value = state.currentLeakRadius; shader.uniforms.uStateBlend.value = state.stateBlend; shader.uniforms.uTransitionAlpha.value = alpha; } }); }); } });
  composer.render();
}

async function load() {
  updateUI(0); updateButtonStates();
  try { setLoading(DICT[state.lang].loading_data); const response = await fetch(CONFIG.BASE_URL + CONFIG.DATA_URL); const data = await response.json(); state.artifacts = Array.isArray(data) ? data : []; } catch { state.artifacts = []; }
  try { initGPU(createFallbackPositions(COUNT)); hideLoading(); updateUI(0); if (!animationStarted) { animationStarted = true; animate(); } } catch (error) { toast(error.message, 'error', 6000); hideLoading(); return; }
  loadModel(0).then(ready => { if (ready && state.modelReady[0]) { setTargets(state.modelTargets[0].positions); updateUI(0); } });
  (async () => { for (let index = 1; index < CONFIG.MODELS.length; index++) { await loadModel(index); updateUI(); } })();
}

window.addEventListener('beforeunload', () => { cancelAnimationFrame(animationFrame); stopGesture(); disposeModels(); });
window.addEventListener('error', event => console.error('[Global error]', event.error || event.message));
window.addEventListener('unhandledrejection', event => console.error('[Unhandled rejection]', event.reason));

load();
