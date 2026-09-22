export const DEVICE_MEMORY = Number(navigator.deviceMemory || 8);
export const CPU_CORES = Number(navigator.hardwareConcurrency || 8);
export const PARTICLE_WIDTH = DEVICE_MEMORY <= 4 || CPU_CORES <= 4 ? 192 : 256;
export const PARTICLE_COUNT = PARTICLE_WIDTH * PARTICLE_WIDTH;
export const PIXEL_RATIO = Math.min(window.devicePixelRatio || 1, 2);
