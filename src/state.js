import { DICT } from './config.js';
import * as THREE from 'three';

export const state = {
  artifacts: [], modelTargets: [], solidModels: [], modelReady: [], modelLoading: new Map(),
  currentIndex: 0, prevIndex: 0, transition: 1, explosion: 0, currentLeakRadius: 0,
  viewMode: 'particle', stateBlend: 0, targetStateBlend: 0, uiVisible: true, inputMode: 'mouse',
  musicPlaying: false, musicAutoStartPending: true, isAILoading: false, isPaused: false, autoRotateAngle: 0, userRotX: 0,
  userRotY: 0, isDragging: false, hasDragged: false, lang: 'en'
};

export const $ = id => document.getElementById(id);
export const dom = {
  loadingText: $('loading-text'), loadingContainer: $('loading-container'), toast: $('toast'),
  camContainer: $('cam-container'), video: $('webcam'), handCanvas: $('hand-canvas'),
  bgMusic: $('bg-music'), hint: $('hint'), uiLayer: $('ui-layer')
};

export const mouse = new THREE.Vector2(9999, 9999);
export let lastX = 0;
export let lastY = 0;
export const prevMousePos = new THREE.Vector3(9999, 9999, 0);
export const currentMousePos = new THREE.Vector3(9999, 9999, 0);
export const localMousePos = new THREE.Vector3(9999, 9999, 0);
export const mouseVelocity = new THREE.Vector3(0, 0, 0);
export let mouseForceActive = 0;

export function setPointerPosition(x, y) { mouse.x = x; mouse.y = y; }
export function setLastPointer(x, y) { lastX = x; lastY = y; }
export function setMouseForce(value) { mouseForceActive = value; }

export function toast(message, type = 'info', duration = 3000) {
  dom.toast.textContent = message;
  dom.toast.className = `show ${type === 'error' ? 'error' : ''}`;
  clearTimeout(dom.toast._timer);
  dom.toast._timer = setTimeout(() => dom.toast.classList.remove('show'), duration);
}

export function setLoading(message) { dom.loadingText.textContent = message; }
export function hideLoading() {
  dom.loadingContainer.style.opacity = '0';
  setTimeout(() => { dom.loadingContainer.style.visibility = 'hidden'; dom.loadingContainer.style.display = 'none'; }, 600);
}

export function updateUI(index = state.currentIndex) {
  const d = DICT[state.lang];
  const artifact = state.artifacts[index] || {};
  const text = value => value?.[state.lang] || value?.zh || '-';
  $('btn-zh').textContent = d.btn_zh; $('btn-en').textContent = d.btn_en;
  $('btn-particle').textContent = d.btn_particle; $('btn-solid').textContent = d.btn_solid;
  $('btn-ui').textContent = state.uiVisible ? d.btn_ui_hide : d.btn_ui_show;
  $('btn-music').textContent = state.musicPlaying ? d.btn_music_off : d.btn_music_on;
  $('btn-input').textContent = state.isAILoading ? d.loading_ai : (state.inputMode === 'mouse' ? d.btn_mouse : d.btn_gesture);
  $('label-integ').textContent = d.integ; $('label-craft').textContent = d.craft; $('label-hist').textContent = d.hist;
  $('label-usage').textContent = d.usage; $('label-type').textContent = d.type; $('label-decoration').textContent = d.decoration;
  dom.hint.innerHTML = state.inputMode === 'mouse' ? d.hint_mouse : d.hint_gesture;
  $('name').textContent = text(artifact.name); $('era').textContent = text(artifact.era);
  $('usage').textContent = text(artifact.usage); $('type').textContent = text(artifact.type); $('decoration').textContent = text(artifact.decoration);
  document.querySelectorAll('.data-bar-fill').forEach(el => { el.style.width = '0%'; });
  setTimeout(() => { $('bar1').style.width = '78%'; $('bar2').style.width = '86%'; $('bar3').style.width = '91%'; }, 50);
}

export function updateButtonStates() {
  $('btn-zh').className = state.lang === 'zh' ? 'active' : '';
  $('btn-en').className = state.lang === 'en' ? 'active' : '';
  $('btn-particle').className = state.viewMode === 'particle' ? 'active' : '';
  $('btn-solid').className = state.viewMode === 'solid' ? 'active' : '';
  $('btn-input').className = state.inputMode === 'gesture' ? 'active' : '';
  $('btn-music').className = state.musicPlaying ? 'active' : '';
}
