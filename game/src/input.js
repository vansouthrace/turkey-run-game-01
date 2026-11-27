// Gobble Dash input: keyboard and mouse, one shared state for the game loop.
export class Input {
  constructor(canvas) {
    this.jumpQueued = false;
    this.hideHeld = false;
    this.confirmQueued = false;
    this.restartQueued = false;
    this.canvas = canvas;
    this.attach();
  }

  attach() {
    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
        event.preventDefault();
        this.jumpQueued = true;
      } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        this.hideHeld = true;
      } else if (event.code === 'Enter') {
        this.confirmQueued = true;
      } else if (event.code === 'KeyR') {
        this.restartQueued = true;
      }
    });
    window.addEventListener('keyup', (event) => {
      if (event.code === 'ArrowDown' || event.code === 'KeyS') this.hideHeld = false;
    });
    this.canvas.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      this.jumpQueued = true;
      this.confirmQueued = true;
    });
    this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  takeJump() {
    const value = this.jumpQueued;
    this.jumpQueued = false;
    return value;
  }

  takeConfirm() {
    const value = this.confirmQueued;
    this.confirmQueued = false;
    return value;
  }

  takeRestart() {
    const value = this.restartQueued;
    this.restartQueued = false;
    return value;
  }
}
