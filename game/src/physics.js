'use strict';
/* Gobble Dash — turkey physics and collision tests.
   The turkey stays at a fixed screen x; the world scrolls past it.
   Jump is a single impulse with gravity; ducking shrinks the hitbox. */

function createTurkey() {
  return {
    x: TURKEY_X,
    y: GROUND_Y - TURKEY_H,
    vy: 0,
    w: TURKEY_W,
    h: TURKEY_H,
    onGround: true,
    ducking: false,
    runPhase: 0,
    invulnerableUntil: 0,
    stumbleTimer: 0,
  };
}

/* The turkey's current hitbox; ducking makes it short and wide. */
function turkeyHitbox(t) {
  if (t.ducking && t.onGround) {
    return { x: t.x - 4, y: GROUND_Y - TURKEY_DUCK_H, w: t.w + 12, h: TURKEY_DUCK_H };
  }
  return { x: t.x, y: t.y, w: t.w, h: t.h };
}

function updateTurkey(t, dt, now) {
  t.ducking = Input.duckHeld() && t.onGround;

  /* Jump only from the ground, on a fresh key press. */
  if (t.onGround && Input.consume(' ', 'ArrowUp', 'w', 'W')) {
    t.vy = JUMP_VELOCITY;
    t.onGround = false;
    SoundBank.jump();
  }

  if (!t.onGround) {
    t.vy += GRAVITY * dt;
    t.y += t.vy * dt;
    if (t.y >= GROUND_Y - t.h) {
      t.y = GROUND_Y - t.h;
      t.vy = 0;
      t.onGround = true;
    }
  }

  if (t.stumbleTimer > 0) t.stumbleTimer -= dt;
  t.runPhase += dt * (t.onGround ? 14 : 4);
}

/* Plain AABB overlap, with a small forgiveness margin. */
function rectsOverlap(a, b) {
  const pad = 6;
  return a.x + pad < b.x + b.w - pad &&
    a.x + a.w - pad > b.x + pad &&
    a.y + pad < b.y + b.h - pad &&
    a.y + a.h - pad > b.y + pad;
}

/* Whether the turkey may be hurt right now. */
function turkeyIsInvulnerable(t, now) {
  return now < t.invulnerableUntil;
}
