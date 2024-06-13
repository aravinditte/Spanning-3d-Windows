
class WindowManager {
	#windows;
	#count;
	#id;
	#winData;
	#winShapeChangeCallback;
	#winChangeCallback;
  
	constructor() {
	  this.#initializeEventListeners();
	}
  
	#initializeEventListeners() {
	  addEventListener("storage", (event) => {
		if (event.key === "windows") {
		  const newWindows = JSON.parse(event.newValue);
		  const winChange = this.#didWindowsChange(this.#windows, newWindows);
  
		  this.#windows = newWindows;
  
		  if (winChange && this.#winChangeCallback) {
			this.#winChangeCallback();
		  }
		}
	  });
  
	  window.addEventListener('beforeunload', () => {
		const index = this.getWindowIndexFromId(this.#id);
		this.#windows.splice(index, 1);
		this.updateWindowsLocalStorage();
	  });
	}
  
	#didWindowsChange(previousWindows, newWindows) {
	  if (previousWindows.length !== newWindows.length) {
		return true;
	  }
  
	  return previousWindows.some((win, index) => win.id !== newWindows[index].id);
	}
  
	init(metaData) {
	  this.#windows = JSON.parse(localStorage.getItem("windows")) || [];
	  this.#count = parseInt(localStorage.getItem("count") || 0, 10) + 1;
  
	  this.#id = this.#count;
	  const shape = this.getWinShape();
	  this.#winData = { id: this.#id, shape, metaData };
	  this.#windows.push(this.#winData);
  
	  localStorage.setItem("count", this.#count);
	  this.updateWindowsLocalStorage();
	}
  
	getWinShape() {
	  return {
		x: window.screenLeft,
		y: window.screenTop,
		w: window.innerWidth,
		h: window.innerHeight,
	  };
	}
  
	getWindowIndexFromId(id) {
	  return this.#windows.findIndex(win => win.id === id);
	}
  
	updateWindowsLocalStorage() {
	  localStorage.setItem("windows", JSON.stringify(this.#windows));
	}
  
	update() {
	  const winShape = this.getWinShape();
  
	  if (this.#hasShapeChanged(winShape)) {
		this.#winData.shape = winShape;
  
		const index = this.getWindowIndexFromId(this.#id);
		this.#windows[index].shape = winShape;
  
		if (this.#winShapeChangeCallback) {
		  this.#winShapeChangeCallback();
		}
  
		this.updateWindowsLocalStorage();
	  }
	}
  
	#hasShapeChanged(newShape) {
	  const { x, y, w, h } = this.#winData.shape;
	  return x !== newShape.x || y !== newShape.y || w !== newShape.w || h !== newShape.h;
	}
  
	setWinShapeChangeCallback(callback) {
	  this.#winShapeChangeCallback = callback;
	}
  
	setWinChangeCallback(callback) {
	  this.#winChangeCallback = callback;
	}
  
	getWindows() {
	  return this.#windows;
	}
  
	getThisWindowData() {
	  return this.#winData;
	}
  
	getThisWindowID() {
	  return this.#id;
	}
  }
  
  export default WindowManager;
  
