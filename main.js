

import WindowManager from './WindowManager.js';

const t = THREE;
let camera, scene, renderer, world;
let near, far;
const pixR = window.devicePixelRatio || 1;
let cubes = [];
let sceneOffsetTarget = { x: 0, y: 0 };
let sceneOffset = { x: 0, y: 0 };

let today = new Date();
today.setHours(0, 0, 0, 0);
today = today.getTime();

let internalTime = getTime();
let windowManager;
let initialized = false;

// Event listener to initialize only when the page is visible
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== 'hidden' && !initialized) {
    init();
  }
});

window.onload = () => {
  if (document.visibilityState !== 'hidden') {
    init();
  }
};

// Initialization function
function init() {
  setTimeout(() => {
    setupScene();
    setupWindowManager();
    resize();
    updateWindowShape(false);
    render();
    window.addEventListener('resize', resize);
  }, 500);
}

// Get time in seconds since the beginning of the day
function getTime() {
  return (Date.now() - today) / 1000.0;
}

// Setup the window manager
function setupWindowManager() {
  windowManager = new WindowManager();
  windowManager.setWinShapeChangeCallback(updateWindowShape);
  windowManager.setWinChangeCallback(windowsUpdated);

  // Custom metadata for window instances
  const metaData = { foo: "bar" };

  // Initialize the window manager and add this window to the centralized pool
  windowManager.init(metaData);

  // Initial update of windows
  windowsUpdated();
}

// Update window information and cubes
function windowsUpdated() {
  const wins = windowManager.getWindows();
  updateNumberOfCubes();
}

// Update the number of cubes based on the number of windows
function updateNumberOfCubes() {
  const wins = windowManager.getWindows();

  // Remove all existing cubes
  cubes.forEach(cube => world.remove(cube));
  cubes = [];

  // Add new cubes based on window data
  wins.forEach((win, i) => {
    const color = new t.Color();
    color.setHSL(i * 0.1, 1.0, 0.5);

    const size = 100 + i * 50;
    const cube = new t.Mesh(
      new t.BoxGeometry(size, size, size),
      new t.MeshBasicMaterial({ color, wireframe: true })
    );

    cube.position.set(win.shape.x + win.shape.w * 0.5, win.shape.y + win.shape.h * 0.5);
    world.add(cube);
    cubes.push(cube);
  });
}

// Update the scene offset
function updateWindowShape(easing = true) {
  sceneOffsetTarget = { x: -window.screenX, y: -window.screenY };
  if (!easing) sceneOffset = sceneOffsetTarget;
}

// Setup the scene
function setupScene() {
  camera = new t.OrthographicCamera(0, window.innerWidth, window.innerHeight, 0, -10000, 10000);
  camera.position.z = 2.5;
  near = camera.position.z - 0.5;
  far = camera.position.z + 0.5;

  scene = new t.Scene();
  scene.background = new t.Color(0.0);
  scene.add(camera);

  renderer = new t.WebGLRenderer({ antialias: true, depthBuffer: true });
  renderer.setPixelRatio(pixR);

  world = new t.Object3D();
  scene.add(world);

  renderer.domElement.setAttribute("id", "scene");
  document.body.appendChild(renderer.domElement);
}

// Render the scene
function render() {
  const time = getTime();
  windowManager.update();

  const falloff = 0.05;
  sceneOffset.x += (sceneOffsetTarget.x - sceneOffset.x) * falloff;
  sceneOffset.y += (sceneOffsetTarget.y - sceneOffset.y) * falloff;

  world.position.set(sceneOffset.x, sceneOffset.y);

  const wins = windowManager.getWindows();
  cubes.forEach((cube, i) => {
    const win = wins[i];
    const posTarget = { x: win.shape.x + win.shape.w * 0.5, y: win.shape.y + win.shape.h * 0.5 };

    cube.position.x += (posTarget.x - cube.position.x) * falloff;
    cube.position.y += (posTarget.y - cube.position.y) * falloff;
    cube.rotation.x = time * 0.5;
    cube.rotation.y = time * 0.3;
  });

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

// Resize the renderer and camera
function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera = new t.OrthographicCamera(0, width, height, 0, -10000, 10000);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

