'use strict';
/* Gobble Dash — the game loop and state machine.
   Modes: title, play, end (caught or escaped).
   ?scene=title|play|kitchen|caught|escaped opens a fixed scene, so
   screenshots show the real game in each of its states. */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const Game = {
  mode: 'title',
  world: createWorld(),
  turkey: createTurkey(),
  time: 0,
  lastTs: 0,
  scene: 'title',
};

function readSceneParam() {
  try {
    const scene = new URLSearchParams(window.location.search).get('scene');
    if (scene === 'play' || scene === 'kitchen' || scene === 'caught' || scene === 'escaped' || scene === 'title') {
      return scene;
    }
  } catch (e) { /* no query string support: plain title screen */ }
  return 'title';
}

function startRun() {
  Game.world = createWorld();
  Game.turkey = createTurkey();
  Game.mode = 'play';
  SoundBank.ensure();
  SoundBank.gobble();
}

function startSeededRun(scene) {
  Game.world = createWorld();
  Game.turkey = createTurkey();
  seedScene(Game.world, scene);
  Game.mode = 'play';
}

function showEnd(scene) {
  Game.world = createWorld();
  Game.turkey = createTurkey();
  if (scene === 'escaped') {
    Game.world.distanceM = GOAL_DISTANCE_M;
    Game.world.cornCollected = 41;
    Game.world.score = GOAL_DISTANCE_M + 41 * CORN_SCORE;
    Game.world.over = true;
    Game.world.escaped = true;
    Game.world.endReason = 'escaped';
  } else {
    Game.world.distanceM = 742;
    Game.world.cornCollected = 18;
    Game.world.score = 742 + 18 * CORN_SCORE;
    Game.world.lives = 0;
    Game.world.farmerGap = 0;
    Game.world.over = true;
    Game.world.endReason = 'caught';
  }
  Game.mode = 'end';
}

function applyScene(scene) {
  Game.scene = scene;
  if (scene === 'play' || scene === 'kitchen') startSeededRun(scene);
  else if (scene === 'caught' || scene === 'escaped') showEnd(scene);
  else Game.mode = 'title';
}

function update(dt) {
  const now = performance.now();
  if (Game.mode === 'title') {
    /* The title scene idles: clouds drift, the turkey shuffles. */
    Game.world.time += dt;
    Game.world.distanceM = 0;
    if (Input.consume(' ', 'Enter') || Input.clickedIn(GAME_WIDTH / 2 - 130, 356, 260, 56)) {
      startRun();
    }
  } else if (Game.mode === 'play') {
    updateTurkey(Game.turkey, dt, now);
    updateWorld(Game.world, Game.turkey, dt, now);
    if (Game.world.over) {
      Game.mode = 'end';
      if (Game.world.escaped) SoundBank.escaped();
      else SoundBank.caught();
    }
  } else if (Game.mode === 'end') {
    if (Input.consume('r', 'R', ' ', 'Enter') ||
      Input.clickedIn(GAME_WIDTH / 2 - 130, 310, 260, 56)) {
      startRun();
    }
  }
  if (Input.consume('m', 'M')) {
    SoundBank.muted = !SoundBank.muted;
  }
}

function render() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  if (Game.mode === 'title') {
    drawTitleScreen(ctx, Game.world, Game.time);
  } else if (Game.mode === 'play') {
    drawBackground(ctx, Game.world, Game.time);
    drawCorns(ctx, Game.world, Game.time);
    drawObstacles(ctx, Game.world, Game.time);
    drawFarmer(ctx, Game.world, Game.time);
    drawTurkey(ctx, Game.turkey, Game.time);
    drawHUD(ctx, Game.world);
  } else {
    drawEndScreen(ctx, Game.world, Game.time);
  }
}

function frame(ts) {
  const dt = Math.min(0.033, Math.max(0, (ts - Game.lastTs) / 1000 || 0.016));
  Game.lastTs = ts;
  Game.time += dt;
  update(dt);
  render();
  Input.endFrame();
  window.requestAnimationFrame(frame);
}

Input.init(canvas);
applyScene(readSceneParam());
window.requestAnimationFrame(frame);
