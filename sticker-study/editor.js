const STORAGE_KEY = 'sticker-garden-layout-v1';
const BACKGROUND_RATIO = 2752 / 1536;
const LABELS = {
  path_entry: '入口小路', path_bend: '转弯小路', path_camera: '拍摄小路',
  pond_a: '池塘一', pond_b: '池塘二', bridge: '木桥',
  camera_platform: '拍摄平台', camera: '相机', workbench: '工作台',
  evidence_board: '灵感板', photo_display: '照片展架',
  willow: '柳树', ginkgo: '银杏', flower_tree: '花树', pine: '松树',
  large_shrub: '大灌木', small_shrub: '小灌木', flowerbed: '花圃',
  bench: '长椅', lamp: '路灯', rocks: '石组',
};
const $ = (selector) => document.querySelector(selector);
const scene = $('#scene');
const sceneItems = $('#scene-items');
const stickerList = $('#sticker-list');
let specs = [];
let dimensions = new Map();
let items = [];
let selectedId = null;
let filter = 'all';
let toastTimer;

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function asset(id) { return `generated/stickers/${id}.png`; }
function specFor(id) { return specs.find((spec) => spec.id === id); }
function selected() { return items.find((item) => item.uid === selectedId); }
function heightFraction(item) {
  const size = dimensions.get(item.id);
  return size ? item.w * BACKGROUND_RATIO * size[1] / size[0] : item.w;
}
function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('is-visible'), 2600);
}
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, items }));
    $('#save-message').textContent = '已自动保存在本机浏览器';
  } catch {
    $('#save-message').textContent = '浏览器无法保存，请导出 JSON 留存';
  }
}
function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (stored.version !== 1 || !Array.isArray(stored.items)) return;
    items = stored.items.filter((item) => specFor(item.id) &&
      typeof item.uid === 'string' &&
      ['x', 'y', 'w', 'rotation', 'z'].every((key) => Number.isFinite(item[key])))
      .map((item) => ({
        uid: item.uid, id: item.id,
        x: clamp(item.x, 0, 1), y: clamp(item.y, 0, 1),
        w: clamp(item.w, .03, .45), rotation: clamp(item.rotation, -180, 180), z: item.z,
      }));
  } catch { toast('旧摆放数据无法读取，已从空画布开始'); }
}
function renderPalette() {
  stickerList.replaceChildren();
  for (const spec of specs.filter((entry) => filter === 'all' || entry.sheet === filter)) {
    const card = document.createElement('article');
    card.className = 'sticker-card';
    const drag = document.createElement('button');
    drag.className = 'sticker-card__drag';
    drag.type = 'button';
    drag.setAttribute('aria-label', `拖动或点击添加${LABELS[spec.id]}`);
    const image = document.createElement('img');
    image.src = asset(spec.id);
    image.alt = '';
    image.draggable = false;
    drag.append(image);
    drag.addEventListener('pointerdown', (event) => beginPaletteDrag(event, spec));
    drag.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        addSticker(spec, null);
      }
    });
    const foot = document.createElement('div');
    foot.className = 'sticker-card__foot';
    const name = document.createElement('span');
    name.textContent = LABELS[spec.id];
    const add = document.createElement('button');
    add.type = 'button';
    add.textContent = '添加 +';
    add.setAttribute('aria-label', `添加${LABELS[spec.id]}到画布`);
    add.addEventListener('click', () => addSticker(spec, null));
    foot.append(name, add);
    card.append(drag, foot);
    stickerList.append(card);
  }
}
function applyObjectStyle(element, item) {
  element.style.left = `${item.x * 100}%`;
  element.style.top = `${item.y * 100}%`;
  element.style.width = `${item.w * 100}%`;
  element.style.transform = `rotate(${item.rotation}deg)`;
  element.style.zIndex = String(item.z);
}
function renderScene() {
  sceneItems.replaceChildren();
  for (const item of items) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `scene-object${item.uid === selectedId ? ' is-selected' : ''}`;
    button.dataset.uid = item.uid;
    button.setAttribute('aria-label', `${LABELS[item.id]}，已摆放贴纸。方向键移动，Delete 删除`);
    const image = document.createElement('img');
    image.src = asset(item.id);
    image.alt = '';
    image.draggable = false;
    button.append(image);
    applyObjectStyle(button, item);
    button.addEventListener('pointerdown', (event) => beginMove(event, item.uid));
    button.addEventListener('click', () => select(item.uid));
    button.addEventListener('keydown', (event) => itemKeydown(event, item.uid));
    sceneItems.append(button);
  }
  $('#placed-count').textContent = `${items.length} 件`;
  $('#empty-note').hidden = items.length > 0;
  updateInspector();
}
function select(uid) {
  selectedId = uid;
  for (const element of sceneItems.children) element.classList.toggle('is-selected', element.dataset.uid === uid);
  updateInspector();
}
function updateInspector() {
  const item = selected();
  $('#inspector-controls').hidden = !item;
  $('#selection-message').hidden = Boolean(item);
  if (!item) return;
  $('#selected-image').src = asset(item.id);
  $('#selected-name').textContent = LABELS[item.id];
  $('#size').value = String(item.w * 100);
  $('#size-value').textContent = `${Math.round(item.w * 100)}%`;
  $('#rotation').value = String(item.rotation);
  $('#rotation-value').textContent = `${item.rotation}°`;
}
function addSticker(spec, position) {
  const width = spec.place[2];
  const stagger = items.length % 6;
  const x = position ? position.x - width / 2 : .48 + stagger * .035;
  const rawY = position ? position.y : .39 + stagger * .045;
  const item = {
    uid: crypto.randomUUID(), id: spec.id,
    x: clamp(x, 0, 1 - width), y: 0,
    w: width, rotation: 0,
    z: Math.max(0, ...items.map((entry) => entry.z)) + 1,
  };
  item.y = clamp(rawY - (position ? heightFraction(item) / 2 : 0), 0, Math.max(0, 1 - heightFraction(item)));
  items.push(item);
  selectedId = item.uid;
  renderScene();
  save();
  toast(`已添加${LABELS[item.id]}`);
  if (innerWidth <= 760) $('.scene-panel').scrollIntoView({ block: 'start' });
}
function pointInScene(clientX, clientY) {
  const rect = scene.getBoundingClientRect();
  if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return null;
  return { x: (clientX - rect.left) / rect.width, y: (clientY - rect.top) / rect.height };
}
function beginPaletteDrag(event, spec) {
  if (event.button !== 0 && event.pointerType === 'mouse') return;
  event.preventDefault();
  const startX = event.clientX;
  const startY = event.clientY;
  const ghost = document.createElement('img');
  ghost.src = asset(spec.id);
  ghost.alt = '';
  ghost.className = 'drag-ghost';
  ghost.style.left = `${startX}px`;
  ghost.style.top = `${startY}px`;
  document.body.append(ghost);
  event.currentTarget.setPointerCapture(event.pointerId);
  const drag = event.currentTarget;
  function move(next) {
    ghost.style.left = `${next.clientX}px`;
    ghost.style.top = `${next.clientY}px`;
  }
  function finish(next) {
    drag.removeEventListener('pointermove', move);
    drag.removeEventListener('pointerup', finish);
    drag.removeEventListener('pointercancel', cancel);
    ghost.remove();
    const position = pointInScene(next.clientX, next.clientY);
    if (position) addSticker(spec, position);
    else if (Math.hypot(next.clientX - startX, next.clientY - startY) < 6) addSticker(spec, null);
  }
  function cancel() {
    drag.removeEventListener('pointermove', move);
    drag.removeEventListener('pointerup', finish);
    drag.removeEventListener('pointercancel', cancel);
    ghost.remove();
  }
  drag.addEventListener('pointermove', move);
  drag.addEventListener('pointerup', finish);
  drag.addEventListener('pointercancel', cancel);
}
function beginMove(event, uid) {
  if (event.button !== 0 && event.pointerType === 'mouse') return;
  event.preventDefault();
  const item = items.find((entry) => entry.uid === uid);
  const element = event.currentTarget;
  const rect = scene.getBoundingClientRect();
  const offsetX = (event.clientX - rect.left) / rect.width - item.x;
  const offsetY = (event.clientY - rect.top) / rect.height - item.y;
  select(uid);
  element.focus();
  element.setPointerCapture(event.pointerId);
  function move(next) {
    item.x = clamp((next.clientX - rect.left) / rect.width - offsetX, 0, Math.max(0, 1 - item.w));
    item.y = clamp((next.clientY - rect.top) / rect.height - offsetY, 0, Math.max(0, 1 - heightFraction(item)));
    applyObjectStyle(element, item);
  }
  function finish() {
    element.removeEventListener('pointermove', move);
    element.removeEventListener('pointerup', finish);
    element.removeEventListener('pointercancel', finish);
    save();
  }
  element.addEventListener('pointermove', move);
  element.addEventListener('pointerup', finish);
  element.addEventListener('pointercancel', finish);
}
function itemKeydown(event, uid) {
  const item = items.find((entry) => entry.uid === uid);
  if (!item) return;
  const delta = event.shiftKey ? .01 : .002;
  const movement = { ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowUp: [0, -delta], ArrowDown: [0, delta] }[event.key];
  if (movement) {
    event.preventDefault();
    select(uid);
    item.x = clamp(item.x + movement[0], 0, Math.max(0, 1 - item.w));
    item.y = clamp(item.y + movement[1], 0, Math.max(0, 1 - heightFraction(item)));
    applyObjectStyle(event.currentTarget, item);
    save();
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault();
    select(uid);
    removeSelected();
  }
}
function updateSelectedStyle() {
  const item = selected();
  const element = sceneItems.querySelector(`[data-uid="${selectedId}"]`);
  if (item && element) applyObjectStyle(element, item);
  updateInspector();
  save();
}
function moveLayer(direction) {
  const item = selected();
  if (!item) return;
  const order = [...items].sort((a, b) => a.z - b.z);
  const index = order.indexOf(item);
  const other = order[index + direction];
  if (!other) return;
  const old = item.z;
  item.z = other.z;
  other.z = old;
  renderScene();
  save();
}
function removeSelected() {
  const item = selected();
  if (!item) return;
  items = items.filter((entry) => entry.uid !== item.uid);
  selectedId = null;
  renderScene();
  save();
  toast(`已移出${LABELS[item.id]}`);
}
function exportLayout() {
  const payload = {
    format: 'sticker-garden-layout', version: 1,
    background: 'Gemini_Generated_Image_4xpf984xpf984xpf.jpeg',
    canvas: { width: 2752, height: 1536 },
    items: [...items].sort((a, b) => a.z - b.z).map(({ uid, id, x, y, w, rotation, z }) => ({ uid, id, x, y, w, rotation, z })),
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sticker-garden-layout.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('布局 JSON 已下载');
}
async function init() {
  try {
    const [manifestResponse, reportResponse] = await Promise.all([fetch('manifest.json'), fetch('generated/report.json')]);
    if (!manifestResponse.ok || !reportResponse.ok) throw new Error('素材清单或抠图报告缺失');
    const [manifest, report] = await Promise.all([manifestResponse.json(), reportResponse.json()]);
    specs = manifest.stickers;
    dimensions = new Map(report.stickers.map((entry) => [entry.id, entry.output_size]));
    $('#total-count').textContent = String(specs.length);
    load();
    renderPalette();
    renderScene();
    if (innerWidth <= 760) $('#scene-viewport').scrollLeft = 260;
  } catch (error) {
    stickerList.textContent = `无法读取素材：${error.message}。请用 serve-editor.sh 启动网页，并确认已运行抠图脚本。`;
    toast('素材读取失败');
  }
}

document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach((entry) => {
    const active = entry === button;
    entry.classList.toggle('is-active', active);
    entry.setAttribute('aria-pressed', String(active));
  });
  renderPalette();
}));
$('#size').addEventListener('input', (event) => {
  const item = selected();
  if (!item) return;
  item.w = Number(event.target.value) / 100;
  item.x = clamp(item.x, 0, Math.max(0, 1 - item.w));
  item.y = clamp(item.y, 0, Math.max(0, 1 - heightFraction(item)));
  updateSelectedStyle();
});
$('#rotation').addEventListener('input', (event) => {
  const item = selected();
  if (!item) return;
  item.rotation = Number(event.target.value);
  updateSelectedStyle();
});
$('#back-button').addEventListener('click', () => moveLayer(-1));
$('#front-button').addEventListener('click', () => moveLayer(1));
$('#remove-button').addEventListener('click', removeSelected);
$('#duplicate-button').addEventListener('click', () => {
  const item = selected();
  if (!item) return;
  const copy = { ...item, uid: crypto.randomUUID(), x: clamp(item.x + .025, 0, 1 - item.w), y: clamp(item.y + .025, 0, Math.max(0, 1 - heightFraction(item))), z: Math.max(...items.map((entry) => entry.z)) + 1 };
  items.push(copy);
  selectedId = copy.uid;
  renderScene();
  save();
});
$('#reset-button').addEventListener('click', () => {
  if (!items.length) return;
  if (!window.confirm('清空当前画布上的全部贴纸？建议先导出 JSON 留存。')) return;
  items = [];
  selectedId = null;
  renderScene();
  save();
  toast('画布已清空');
});
$('#export-button').addEventListener('click', exportLayout);
$('#zoom').addEventListener('input', (event) => {
  const value = Number(event.target.value);
  scene.style.setProperty('--stage-width', `${value}%`);
  scene.style.setProperty('--zoom', String(value / 100));
  $('#zoom-value').textContent = `${value}%`;
});
scene.addEventListener('pointerdown', (event) => {
  if (event.target === scene || event.target === sceneItems) select(null);
});
init();
