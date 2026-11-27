'use strict';
/* Gobble Dash — keyboard and mouse input.
   Keyboard: Arrow keys / A D to run, Space / Up / W to jump,
   Down / S to duck, Enter to start, R to restart, M to mute.
   Mouse: click buttons on the title and end screens. */

const Input = {
  held: {},
  pressed: {},
  mouseX: 0,
  mouseY: 0,
  clicked: false,
  clickX: 0,
  clickY: 0,

  init: function (canvas) {
    const self = this;
    window.addEventListener('keydown', function (e) {
      const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
      if (gameKeys.indexOf(e.key) >= 0) e.preventDefault();
      if (!e.repeat) self.pressed[e.key] = true;
      self.held[e.key] = true;
      SoundBank.ensure();
    });
    window.addEventListener('keyup', function (e) {
      self.held[e.key] = false;
    });
    canvas.addEventListener('mousedown', function (e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = GAME_WIDTH / rect.width;
      const scaleY = GAME_HEIGHT / rect.height;
      self.mouseX = (e.clientX - rect.left) * scaleX;
      self.mouseY = (e.clientY - rect.top) * scaleY;
      self.clicked = true;
      self.clickX = self.mouseX;
      self.clickY = self.mouseY;
      SoundBank.ensure();
    });
    /* Keep focus on the canvas so arrow keys never scroll the page. */
    canvas.setAttribute('tabindex', '0');
    canvas.addEventListener('click', function () { canvas.focus(); });
  },

  /* Edge-triggered: true once per key press, then consumed. */
  consume: function () {
    const keys = Array.prototype.slice.call(arguments);
    for (let i = 0; i < keys.length; i++) {
      if (this.pressed[keys[i]]) {
        this.pressed[keys[i]] = false;
        return true;
      }
    }
    return false;
  },

  endFrame: function () {
    this.pressed = {};
    this.clicked = false;
  },

  jumpHeld: function () {
    return !!this.held[' '] || !!this.held['ArrowUp'] || !!this.held['w'] || !!this.held['W'];
  },

  duckHeld: function () {
    return !!this.held['ArrowDown'] || !!this.held['s'] || !!this.held['S'];
  },

  sprintHeld: function () {
    return !!this.held['ArrowRight'] || !!this.held['d'] || !!this.held['D'];
  },

  slowHeld: function () {
    return !!this.held['ArrowLeft'] || !!this.held['a'] || !!this.held['A'];
  },

  /* True when the latest click landed inside the given canvas rect. */
  clickedIn: function (x, y, w, h) {
    return this.clicked && this.clickX >= x && this.clickX <= x + w &&
      this.clickY >= y && this.clickY <= y + h;
  },
};
