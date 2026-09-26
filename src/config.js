export const DICT = {
  zh: {
    btn_zh: '中文', btn_en: 'EN', btn_particle: '粒子态', btn_solid: '实体态',
    btn_ui_hide: '隐藏标签', btn_ui_show: '显示标签', btn_mouse: '鼠标', btn_gesture: '手势',
    loading_ai: '启动 AI...', loading_err: '摄像头/AI加载失败', btn_music_on: '音乐', btn_music_off: '暂停',
    loading_data: '解析星域坐标', loading_model: '下载 3D 节点', integ: '完整度', craft: '工艺', hist: '历史',
    usage: '用途', type: '器型', decoration: '纹饰',
    hint_mouse: '<span>滚轮:缩放</span><span>拖拽:旋转</span><span>悬停:挖空</span><span>单击:爆破</span><span>空格:切换</span>',
    hint_gesture: '<span>挥手↔:切模型</span><span>挥手↕:切状态</span><span>捏合:旋转/爆破</span><span>双手:缩放</span>',
    err: '异常: ', toast_no_model: '模型尚未加载完成', toast_audio_blocked: '音频被拦截，请再点一次',
    toast_context_lost: '图形上下文丢失...', toast_context_restored: '已恢复'
  },
  en: {
    btn_zh: '中文', btn_en: 'EN', btn_particle: 'PARTICLE', btn_solid: 'SOLID',
    btn_ui_hide: 'HIDE UI', btn_ui_show: 'SHOW UI', btn_mouse: 'MOUSE', btn_gesture: 'GESTURE',
    loading_ai: 'STARTING AI...', loading_err: 'CAM/AI ERROR', btn_music_on: 'BGM', btn_music_off: 'PAUSE',
    loading_data: 'LOADING COORDS', loading_model: 'DOWNLOADING', integ: 'INTEG', craft: 'CRAFT', hist: 'HIST',
    usage: 'USAGE', type: 'TYPE', decoration: 'PATTERN',
    hint_mouse: '<span>SCROLL:ZOOM</span><span>DRAG:ROTATE</span><span>HOVER:DISSOLVE</span><span>CLICK:BURST</span><span>SPACE:SWITCH</span>',
    hint_gesture: '<span>SWIPE↔:SWITCH</span><span>SWIPE↕:STATE</span><span>PINCH:ROTATE</span><span>2-HANDS:ZOOM</span>',
    err: 'ERROR: ', toast_no_model: 'MODEL NOT LOADED YET', toast_audio_blocked: 'AUDIO BLOCKED, TAP AGAIN',
    toast_context_lost: 'WEBGL CONTEXT LOST', toast_context_restored: 'RECOVERED'
  }
};

const baseUrl = new URL('../', import.meta.url).href.replace(/\/$/, '');
export const CONFIG = {
  BASE_URL: baseUrl,
  MODELS: [
    '/public/models/wu-wang-zheng-shang-gui.glb',
    '/public/models/zeng-hou-yi-bian-zhong.glb',
    '/public/models/erlitou-jue.glb',
    '/public/models/hou-si-mu-wu-ding.glb',
    '/public/models/si-yang-fang-zun.glb'
  ],
  DATA_URL: '/public/data/introduce.json',
  MUSIC_URL: '/public/music/background-music.mp3',
  CAMERA: { fov: 55, near: 0.1, far: 300, minZ: 4.5, maxZ: 18, defaultZ: 8 },
  REF_DIST: 8, MUSIC_VOLUME: 0.5, LOAD_TIMEOUT_MS: 20000, GESTURE_FPS: 30
};

export function detectQuality() {
  const mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  let width = 512;
  if (mobile || cores <= 4 || memory <= 2) width = 256;
  else if (cores <= 6 || memory <= 4) width = 384;
  return { width, pixelRatio: mobile ? Math.min(dpr, 1.5) : dpr };
}

export const QUALITY = detectQuality();
export const WIDTH = QUALITY.width;
export const COUNT = WIDTH * WIDTH;
export const PIXEL_RATIO = QUALITY.pixelRatio;
