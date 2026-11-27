'use strict';
/* Gobble Dash — the scrolling world: distance, zones, obstacle and
   corn spawning, the farmer's closing gap, and hit detection.
   The turkey flees rightward; obstacles scroll left past it. */

function zoneOf(distanceM) {
  if (distanceM < ZONE_FARMYARD_END) return 0;
  if (distanceM < ZONE_KITCHEN_END) return 1;
  return 2;
}

/* Difficulty 0..1 as the run stretches toward the woods. */
function difficultyOf(distanceM) {
  return Math.min(1, distanceM / GOAL_DISTANCE_M);
}

function createWorld() {
  return {
    distanceM: 0,
    speed: BASE_SPEED,
    score: 0,
    cornCollected: 0,
    lives: START_LIVES,
    farmerGap: FARMER_GAP_START,
    obstacles: [],
    corns: [],
    spawnIn: 420,
    time: 0,
    over: false,
    escaped: false,
    endReason: '',
  };
}

/* --- obstacle factories (all plain data, no drawing here) --- */

function makeFence(x) {
  return { kind: 'fence', x: x, y: GROUND_Y - 62, w: 26, h: 62 };
}

function makeHay(x) {
  return { kind: 'hay', x: x, y: GROUND_Y - 58, w: 74, h: 58 };
}

function makeOven(x) {
  return { kind: 'oven', x: x, y: GROUND_Y - 74, w: 150, h: 74 };
}

function makeFallingKnife(x) {
  return { kind: 'knifeFall', x: x, y: -90, w: 22, h: 96, vy: 0, stuck: false, stuckTimer: 0 };
}

function makeSwingKnife(x) {
  return { kind: 'knifeSwing', x: x, y: GROUND_Y - 150, w: 30, h: 150, angle: -0.9, dir: 1 };
}

function makeCorn(x, y) {
  return { x: x, y: y, taken: false, bob: Math.random() * 6.28 };
}

/* Pick the next obstacle group for the current zone and difficulty. */
function pickObstacle(zone, diff) {
  const roll = Math.random();
  if (zone === 0) {
    if (roll < 0.45) return makeFence;
    if (roll < 0.85) return makeHay;
    return makeFallingKnife;
  }
  if (zone === 1) {
    if (roll < 0.3) return makeOven;
    if (roll < 0.6) return makeFallingKnife;
    if (roll < 0.85) return makeSwingKnife;
    return makeHay;
  }
  if (roll < 0.35) return makeFence;
  if (roll < 0.7) return makeHay;
  if (roll < 0.9) return makeSwingKnife;
  return makeFallingKnife;
}

function spawnGroup(world) {
  const zone = zoneOf(world.distanceM);
  const diff = difficultyOf(world.distanceM);
  const maker = pickObstacle(zone, diff);
  const x = GAME_WIDTH + 40;
  const ob = maker(x);
  world.obstacles.push(ob);
  /* Ovens are long; give the turkey room to land after one. */
  if (ob.kind === 'oven') world.spawnIn = 620;

  /* Corn: an arc over jumpable things, a low row elsewhere. */
  const cornRoll = Math.random();
  if (cornRoll < 0.65) {
    const baseY = ob.kind === 'oven' ? GROUND_Y - 190 : GROUND_Y - 150;
    const n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const arc = Math.sin((i / (n - 1)) * Math.PI) * 34;
      world.corns.push(makeCorn(x - 30 + i * 34, baseY - arc));
    }
  } else {
    const n = 3;
    for (let i = 0; i < n; i++) {
      world.corns.push(makeCorn(x + 60 + i * 36, GROUND_Y - 46));
    }
  }
}

/* --- per-frame update --- */

function updateWorld(world, turkey, dt, now) {
  world.time += dt;
  const diff = difficultyOf(world.distanceM);

  /* Speed ramps with distance; sprinting and slowing are the player's choice. */
  let speed = BASE_SPEED + (MAX_SPEED - BASE_SPEED) * diff;
  if (Input.sprintHeld()) speed += SPRINT_BONUS;
  if (Input.slowHeld()) speed -= SLOW_PENALTY;
  if (turkey.stumbleTimer > 0) speed *= 0.45;
  speed = Math.max(120, speed);
  world.speed = speed;

  world.distanceM += (speed * dt) / PX_PER_METER;
  world.score = Math.floor(world.distanceM) + world.cornCollected * CORN_SCORE;

  /* The farmer drifts closer whenever the turkey is not sprinting. */
  if (Input.sprintHeld()) {
    world.farmerGap = Math.min(100, world.farmerGap + FARMER_GAP_SPRINT_GAIN_PER_S * dt);
  } else {
    world.farmerGap = Math.max(0, world.farmerGap - FARMER_GAP_DRIFT_PER_S * dt);
  }

  /* Spawn the next group when the last one has scrolled far enough. */
  world.spawnIn -= speed * dt;
  if (world.spawnIn <= 0) {
    spawnGroup(world);
    const gap = SPAWN_GAP_MAX - (SPAWN_GAP_MAX - SPAWN_GAP_MIN) * diff;
    world.spawnIn = gap * (0.8 + Math.random() * 0.5);
  }

  /* Scroll and animate obstacles. */
  for (let i = world.obstacles.length - 1; i >= 0; i--) {
    const ob = world.obstacles[i];
    ob.x -= speed * dt;
    if (ob.kind === 'knifeFall') {
      if (!ob.stuck) {
        ob.vy += 2600 * dt;
        ob.y += ob.vy * dt;
        if (ob.y >= GROUND_Y - ob.h) {
          ob.y = GROUND_Y - ob.h;
          ob.stuck = true;
          ob.stuckTimer = 0.9;
        }
      } else {
        ob.stuckTimer -= dt;
      }
    }
    if (ob.kind === 'knifeSwing') {
      ob.angle += ob.dir * dt * (1.4 + diff * 1.2);
      if (ob.angle > 0.9) ob.dir = -1;
      if (ob.angle < -0.9) ob.dir = 1;
    }
    if (ob.x + ob.w < -40 || (ob.kind === 'knifeFall' && ob.stuck && ob.stuckTimer <= 0)) {
      world.obstacles.splice(i, 1);
    }
  }

  /* Scroll corn; collect what the turkey touches. */
  const tb = turkeyHitbox(turkey);
  for (let i = world.corns.length - 1; i >= 0; i--) {
    const c = world.corns[i];
    c.x -= speed * dt;
    c.bob += dt * 5;
    if (c.x < -40) {
      world.corns.splice(i, 1);
      continue;
    }
    if (!c.taken && rectsOverlap(tb, { x: c.x - 16, y: c.y - 16, w: 32, h: 32 })) {
      c.taken = true;
      world.cornCollected++;
      SoundBank.corn();
      world.corns.splice(i, 1);
    }
  }

  /* Hits: anything the turkey overlaps while vulnerable costs a life. */
  if (!turkeyIsInvulnerable(turkey, now)) {
    for (let i = 0; i < world.obstacles.length; i++) {
      const ob = world.obstacles[i];
      if (obstacleHitsTurkey(ob, turkey)) {
        world.lives--;
        turkey.invulnerableUntil = now + INVULNERABLE_MS;
        turkey.stumbleTimer = 0.7;
        world.farmerGap = Math.max(0, world.farmerGap - FARMER_GAP_STUMBLE_LOSS);
        SoundBank.thud();
        break;
      }
    }
  }

  /* End conditions. */
  if (world.lives <= 0) {
    world.over = true;
    world.endReason = 'hit';
  } else if (world.farmerGap <= 0) {
    world.over = true;
    world.endReason = 'caught';
  } else if (world.distanceM >= GOAL_DISTANCE_M) {
    world.over = true;
    world.escaped = true;
    world.endReason = 'escaped';
  }
}

/* Hitbox of one obstacle against the turkey's current hitbox. */
function obstacleHitsTurkey(ob, turkey) {
  const tb = turkeyHitbox(turkey);
  if (ob.kind === 'fence' || ob.kind === 'hay') {
    return rectsOverlap(tb, { x: ob.x, y: ob.y, w: ob.w, h: ob.h });
  }
  if (ob.kind === 'oven') {
    /* The oven is a hot floor zone: only dangerous on the ground. */
    if (!turkey.onGround) return false;
    return tb.x + tb.w > ob.x + 8 && tb.x < ob.x + ob.w - 8;
  }
  if (ob.kind === 'knifeFall') {
    return rectsOverlap(tb, { x: ob.x, y: ob.y, w: ob.w, h: ob.h });
  }
  if (ob.kind === 'knifeSwing') {
    /* The blade swings at standing-head height: ducking slips under it. */
    if (turkey.ducking && turkey.onGround) return false;
    const tipX = ob.x + Math.sin(ob.angle) * 95;
    const tipY = ob.y + 58 + Math.cos(ob.angle) * 95;
    return rectsOverlap(tb, { x: tipX - 26, y: tipY - 14, w: 52, h: 28 });
  }
  return false;
}

/* --- fixed scenes for screenshots: a mid-run, a kitchen stretch,
   and the two end screens, all built from the same game objects. --- */

function seedScene(world, scene) {
  if (scene === 'play') {
    world.distanceM = 300;
    world.cornCollected = 12;
    world.score = 300 + 12 * CORN_SCORE;
    world.obstacles.push(makeFence(620));
    world.obstacles.push(makeHay(820));
    const knife = makeFallingKnife(560);
    knife.y = 60;
    knife.vy = 200;
    world.obstacles.push(knife);
    world.corns.push(makeCorn(420, GROUND_Y - 170));
    world.corns.push(makeCorn(456, GROUND_Y - 200));
    world.corns.push(makeCorn(492, GROUND_Y - 170));
    world.corns.push(makeCorn(700, GROUND_Y - 46));
    world.corns.push(makeCorn(736, GROUND_Y - 46));
  }
  if (scene === 'kitchen') {
    world.distanceM = 560;
    world.cornCollected = 24;
    world.score = 560 + 24 * CORN_SCORE;
    world.obstacles.push(makeOven(620));
    const swing = makeSwingKnife(860);
    swing.angle = 0.5;
    world.obstacles.push(swing);
    const knife = makeFallingKnife(640);
    knife.y = 60;
    knife.vy = 200;
    world.obstacles.push(knife);
    world.corns.push(makeCorn(700, GROUND_Y - 200));
    world.corns.push(makeCorn(736, GROUND_Y - 226));
    world.corns.push(makeCorn(772, GROUND_Y - 200));
  }
}
