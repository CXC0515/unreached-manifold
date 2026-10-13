const STORAGE_KEY = 'sticker-garden-home-v1';
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
const sceneViewport = $('#scene-viewport');
const targets = $('#targets');
const placedItems = $('#placed-items');
const stickerList = $('#sticker-list');
let layout = null;
let sheets = {};
let placed = {};
let selectedCard = null;
let filter = 'all';
let page = 0;
const PAGE_SIZE = 4;
let toastTimer;

function stickerUrl(id) { return `assets/${id}.webp`; }
function itemFor(uid) { return layout.items.find((item) => item.uid === uid); }
function isCardUsed(uid) { return Object.values(placed).includes(uid); }
function isComplete() { return Object.keys(placed).length === layout.items.length; }
function showToast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('is-visible'), 2500);
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, placed })); }
  catch { showToast('浏览器无法保存进度，请保持页面打开'); }
}
function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (data.version !== 1 || !data.placed || typeof data.placed !== 'object') return;
    const valid = {};
    const used = new Set();
    for (const [targetUid, cardUid] of Object.entries(data.placed)) {
      const target = itemFor(targetUid);
      const card = itemFor(cardUid);
      if (target && card && target.id === card.id && !used.has(cardUid)) {
        valid[targetUid] = cardUid;
        used.add(cardUid);
      }
    }
    placed = valid;
  } catch { showToast('旧进度无法读取，已重新开始'); }
}
function decoratePosition(element, item) {
  element.style.left = `${item.x * 100}%`;
  element.style.top = `${item.y * 100}%`;
  element.style.width = `${item.w * 100}%`;
  element.style.transform = `rotate(${item.rotation}deg)`;
  element.style.zIndex = String(item.z + 10);
}
function renderBoard() {
  targets.replaceChildren();
  placedItems.replaceChildren();
  for (const item of layout.items) {
    if (placed[item.uid]) {
      const element = document.createElement(item.id === 'camera' && isComplete() ? 'button' : 'div');
      element.className = `placed${item.id === 'camera' && isComplete() ? ' is-camera-ready' : ''}`;
      if (element.tagName === 'BUTTON') {
        element.type = 'button';
        element.setAttribute('aria-label', '相机已经就位，点击拍摄并查看作品');
        element.addEventListener('click', () => openReveal('shot'));
      }
      const image = document.createElement('img');
      image.src = stickerUrl(item.id);
      image.alt = '';
      image.draggable = false;
      element.append(image);
      decoratePosition(element, item);
      placedItems.append(element);
    } else {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `target${selectedCard && itemFor(selectedCard)?.id === item.id ? ' is-match' : ''}`;
      button.dataset.uid = item.uid;
      button.setAttribute('aria-label', `${LABELS[item.id]}的摆放轮廓`);
      const image = document.createElement('img');
      image.src = stickerUrl(item.id);
      image.alt = '';
      image.draggable = false;
      button.append(image);
      decoratePosition(button, item);
      button.addEventListener('click', () => onTargetClick(item.uid, button));
      targets.append(button);
    }
  }
  const count = Object.keys(placed).length;
  const remaining = layout.items.length - count;
  $('#progress-number').textContent = `${count} / ${layout.items.length}`;
  $('#progress-fill').style.width = `${count / layout.items.length * 100}%`;
  $('#progress-hint').textContent = remaining ? `还有 ${remaining} 件等待安放` : '花园已完成，去摄影角落拍一张';
  $('#camera-button').disabled = remaining > 0;
  $('#scene-message').textContent = remaining
    ? selectedCard ? `已选中${LABELS[itemFor(selectedCard).id]}，点击画布中发亮的对应轮廓。` : '点击贴纸，再点击相同轮廓；也可以直接拖过去。'
    : '花园完成了。点击相机或右上方的“拍摄”。';
}
function scrambleValue(item) {
  let score = 0;
  for (const char of item.uid) score = (score * 31 + char.charCodeAt(0)) % 9973;
  return score;
}
function renderTray() {
  stickerList.replaceChildren();
  const remaining = layout.items
    .filter((item) => !isCardUsed(item.uid))
    .sort((a, b) => scrambleValue(a) - scrambleValue(b));
  const pages = Math.max(1, Math.ceil(remaining.length / PAGE_SIZE));
  page = Math.min(page, pages - 1);
  const visible = remaining.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  for (const item of visible) {
    const card = document.createElement('article');
    card.className = `sticker-card${selectedCard === item.uid ? ' is-selected' : ''}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `选取或拖动${LABELS[item.id]}`);
    const image = document.createElement('img');
    image.src = stickerUrl(item.id);
    image.alt = '';
    image.draggable = false;
    const label = document.createElement('span');
    label.textContent = LABELS[item.id];
    button.append(image, label);
    button.addEventListener('pointerdown', (event) => beginDrag(event, item.uid));
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectCard(item.uid, true);
      }
    });
    card.append(button);
    stickerList.append(card);
  }
  $('#page-indicator').textContent = `${String(page + 1).padStart(2, '0')} / ${String(pages).padStart(2, '0')}`;
  $('#page-prev').disabled = page === 0;
  $('#page-next').disabled = page >= pages - 1;
  stickerList.setAttribute('aria-label', `贴纸包第 ${page + 1} 页，共 ${pages} 页`);
}
function selectCard(uid, keyboard = false) {
  selectedCard = uid;
  renderTray();
  renderBoard();
  showToast(`已选中${LABELS[itemFor(uid).id]}，点击发亮的轮廓`);
  if (innerWidth <= 800) {
    $('.scene-shell').scrollIntoView({ block: 'start' });
    const match = targets.querySelector('.target.is-match');
    if (match) sceneViewport.scrollLeft = Math.max(0, match.offsetLeft - sceneViewport.clientWidth / 2);
  }
  if (keyboard) targets.querySelector('.target.is-match')?.focus({ preventScroll: true });
}
function onTargetClick(targetUid, element) {
  const target = itemFor(targetUid);
  if (!selectedCard) {
    showToast(`这里需要${LABELS[target.id]}，先从贴纸箱里选一张`);
    return;
  }
  const card = itemFor(selectedCard);
  if (card.id !== target.id) {
    element.classList.add('is-wrong');
    setTimeout(() => element.classList.remove('is-wrong'), 450);
    showToast(`轮廓不匹配，这里需要${LABELS[target.id]}`);
    return;
  }
  placeSticker(targetUid, selectedCard);
}
function placeSticker(targetUid, cardUid) {
  if (placed[targetUid] || isCardUsed(cardUid)) return;
  placed[targetUid] = cardUid;
  const label = LABELS[itemFor(targetUid).id];
  selectedCard = null;
  save();
  renderTray();
  renderBoard();
  showToast(isComplete() ? '花园完成！相机现在可以拍摄了' : `${label}已贴好`);
}
function nearestTarget(cardUid, clientX, clientY) {
  const id = itemFor(cardUid).id;
  let best = null;
  let bestDistance = Infinity;
  for (const element of targets.children) {
    const item = itemFor(element.dataset.uid);
    if (item.id !== id) continue;
    const rect = element.getBoundingClientRect();
    const dx = Math.max(rect.left - clientX, 0, clientX - rect.right);
    const dy = Math.max(rect.top - clientY, 0, clientY - rect.bottom);
    const distance = Math.hypot(dx, dy);
    if (distance <= Math.max(28, rect.width * .25) && distance < bestDistance) {
      best = item.uid;
      bestDistance = distance;
    }
  }
  return best;
}
function beginDrag(event, uid) {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  event.preventDefault();
  const button = event.currentTarget;
  const startX = event.clientX;
  const startY = event.clientY;
  const ghost = document.createElement('img');
  ghost.className = 'drag-ghost';
  ghost.src = stickerUrl(itemFor(uid).id);
  ghost.alt = '';
  ghost.style.left = `${startX}px`;
  ghost.style.top = `${startY}px`;
  document.body.append(ghost);
  button.setPointerCapture(event.pointerId);
  function move(next) {
    ghost.style.left = `${next.clientX}px`;
    ghost.style.top = `${next.clientY}px`;
  }
  function cleanup() {
    button.removeEventListener('pointermove', move);
    button.removeEventListener('pointerup', finish);
    button.removeEventListener('pointercancel', cancel);
    ghost.remove();
  }
  function finish(next) {
    cleanup();
    if (Math.hypot(next.clientX - startX, next.clientY - startY) < 6) {
      selectCard(uid);
      return;
    }
    const targetUid = nearestTarget(uid, next.clientX, next.clientY);
    if (targetUid) placeSticker(targetUid, uid);
    else showToast('靠近相同的淡色轮廓再松手，或点选贴纸后点轮廓');
  }
  function cancel() { cleanup(); }
  button.addEventListener('pointermove', move);
  button.addEventListener('pointerup', finish);
  button.addEventListener('pointercancel', cancel);
}
function renderShotScene() {
  const shot = $('#shot-scene');
  shot.replaceChildren();
  for (const item of [...layout.items].sort((a, b) => a.z - b.z)) {
    const image = document.createElement('img');
    image.src = stickerUrl(item.id);
    image.alt = '';
    image.style.left = `${item.x * 100}%`;
    image.style.top = `${item.y * 100}%`;
    image.style.width = `${item.w * 100}%`;
    image.style.transform = `rotate(${item.rotation}deg)`;
    image.style.zIndex = String(item.z);
    shot.append(image);
  }
}
function openReveal(mode) {
  if (mode === 'shot' && !isComplete()) return;
  $('#reveal-eyebrow').textContent = mode === 'shot' ? 'A PHOTO FROM THE GARDEN' : 'WORKS / DIRECT ACCESS';
  $('#reveal-title').textContent = mode === 'shot' ? '把想法，拍成能用的作品。' : '我的作品与探索';
  $('#reveal-intro').textContent = mode === 'shot'
    ? '花园完成了。镜头里留下的，是把真实需求、资料与 AI 连接起来的产品思考。'
    : '可以直接看内容，不需要先拼完花园。这里沿用当前主页已有的项目与方向介绍。';
  renderShotScene();
  $('#reveal-dialog').showModal();
}
async function init() {
  try {
    const [layoutResponse, manifestResponse] = await Promise.all([fetch('layout.json'), fetch('manifest.json')]);
    if (!layoutResponse.ok || !manifestResponse.ok) throw new Error('布局或素材清单缺失');
    const [loadedLayout, manifest] = await Promise.all([layoutResponse.json(), manifestResponse.json()]);
    if (loadedLayout.format !== 'sticker-garden-layout' || loadedLayout.version !== 1 ||
        loadedLayout.items.length !== 23 || new Set(loadedLayout.items.map((item) => item.uid)).size !== 23) {
      throw new Error('布局文件格式不符合当前试玩页');
    }
    layout = loadedLayout;
    sheets = Object.fromEntries(manifest.stickers.map((item) => [item.id, item.sheet]));
    if (layout.items.some((item) => !sheets[item.id])) throw new Error('布局里有缺失的贴纸素材');
    $('#background').src = 'assets/background.webp';
    load();
    renderBoard();
    renderTray();
    if (innerWidth <= 800) sceneViewport.scrollLeft = 0;
  } catch (error) {
    $('#scene-message').textContent = `无法加载花园：${error.message}`;
    showToast('花园加载失败，请检查素材文件');
  }
}

$('#page-prev').addEventListener('click', () => { page--; renderTray(); });
$('#page-next').addEventListener('click', () => { page++; renderTray(); });
$('#pack-jump').addEventListener('click', () => { sceneViewport.scrollLeft = 0; sceneViewport.scrollIntoView({ block: 'center' }); stickerList.querySelector('button')?.focus({ preventScroll: true }); });
$('#zoom').addEventListener('input', (event) => {
  const value = Number(event.target.value);
  scene.style.setProperty('--scene-width', `${value}%`);
  scene.style.setProperty('--zoom', String(value / 100));
  $('#zoom-output').textContent = `${value}%`;
});
$('#camera-button').addEventListener('click', () => openReveal('shot'));
$('#reveal-dialog .reveal-link').addEventListener('click', () => $('#reveal-dialog').close());
const legacyDialog = $('#legacy-dialog');
const legacyFrame = $('#legacy-frame');
const legacyNames = ['教师 AI 工作台', '空间与城市', '知识手记'];
let legacyPhase = 0;
function selectLegacyPhase(attempt = 0) {
  if (!legacyDialog.open) return;
  const dockButtons = legacyFrame.contentDocument?.querySelectorAll('.dock-item');
  if (!dockButtons?.length) {
    if (attempt < 30) setTimeout(() => selectLegacyPhase(attempt + 1), 50);
    return;
  }
  dockButtons[legacyPhase]?.click();
  setTimeout(() => {
    if (!legacyDialog.open) return;
    const content = legacyFrame.contentDocument?.querySelector('.phase-content');
    content?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, 420);
}
legacyFrame.addEventListener('load', () => {
  if (legacyDialog.open) selectLegacyPhase();
});
document.querySelectorAll('.legacy-open').forEach((button) => button.addEventListener('click', () => {
  legacyPhase = Number(button.dataset.legacyPhase);
  $('#legacy-dialog-title').textContent = legacyNames[legacyPhase];
  legacyDialog.showModal();
  if (legacyFrame.getAttribute('src') !== 'original/index.html') legacyFrame.src = 'original/index.html';
  else selectLegacyPhase();
}));
$('#legacy-close').addEventListener('click', () => legacyDialog.close());
legacyDialog.addEventListener('click', (event) => {
  if (event.target === legacyDialog) legacyDialog.close();
});
legacyDialog.addEventListener('close', () => { legacyFrame.src = 'about:blank'; });
$('#reset-button').addEventListener('click', () => {
  if (!layout || !Object.keys(placed).length) return;
  if (!confirm('重新开始拼贴？当前进度会清空。')) return;
  placed = {};
  page = 0;
  selectedCard = null;
  save();
  renderBoard();
  renderTray();
  showToast('花园已重置');
});
$('#close-dialog').addEventListener('click', () => $('#reveal-dialog').close());
$('#reveal-dialog').addEventListener('click', (event) => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && selectedCard && !$('#reveal-dialog').open) {
    selectedCard = null;
    renderTray();
    renderBoard();
  }
});
init();
