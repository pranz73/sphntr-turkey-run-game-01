'use strict';
/* Gobble Dash — all canvas drawing: the farm, the kitchen yard, the
   woods, the turkey, the farmer, the dangers, the HUD and the menus.
   Every shape is drawn from code; the game ships no image files. */

function drawBackground(ctx, world, time) {
  const zone = zoneOf(world.distanceM);
  const scroll = world.distanceM * PX_PER_METER;

  /* Sky. */
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, PALETTE.skyTop);
  sky.addColorStop(0.55, PALETTE.skyMid);
  sky.addColorStop(1, PALETTE.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, GAME_WIDTH, GROUND_Y);

  /* Sun with a soft halo. */
  ctx.fillStyle = PALETTE.sun;
  ctx.beginPath();
  ctx.arc(820, 84, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 243, 196, 0.35)';
  ctx.beginPath();
  ctx.arc(820, 84, 52, 0, Math.PI * 2);
  ctx.fill();

  /* Drifting clouds. */
  ctx.fillStyle = 'rgba(255, 244, 214, 0.85)';
  drawCloud(ctx, 140 - (scroll * 0.08 % 1100), 70);
  drawCloud(ctx, 520 - (scroll * 0.08 % 1100), 120);
  drawCloud(ctx, 900 - (scroll * 0.08 % 1100), 56);

  /* Rolling hills, two parallax layers. */
  ctx.fillStyle = PALETTE.hillFar;
  drawHills(ctx, scroll * 0.2, 330, 46, 150);
  ctx.fillStyle = PALETTE.hillNear;
  drawHills(ctx, scroll * 0.45, 380, 60, 190);

  /* Zone scenery: farmhouse, then the outdoor kitchen, then pines. */
  if (zone === 0) drawFarmhouse(ctx, 700 - (scroll * 0.6 % 1400), 300);
  if (zone === 1) drawKitchenShed(ctx, 720 - (scroll * 0.6 % 1400), 290);
  if (zone === 2) drawPines(ctx, scroll * 0.6, 300);

  /* Ground: grass strip over dirt. */
  ctx.fillStyle = PALETTE.grass;
  ctx.fillRect(0, GROUND_Y, GAME_WIDTH, 26);
  ctx.fillStyle = PALETTE.dirt;
  ctx.fillRect(0, GROUND_Y + 26, GAME_WIDTH, GAME_HEIGHT - GROUND_Y - 26);
  ctx.fillStyle = PALETTE.dirtDark;
  for (let x = 0; x < GAME_WIDTH; x += 46) {
    const px = x - (scroll % 46);
    ctx.fillRect(px, GROUND_Y + 34, 22, 4);
    ctx.fillRect(px + 12, GROUND_Y + 52, 18, 4);
  }
  /* Grass tufts scrolling past. */
  ctx.strokeStyle = '#4e7a28';
  ctx.lineWidth = 2;
  for (let x = 0; x < GAME_WIDTH; x += 90) {
    const px = x - (scroll % 90);
    ctx.beginPath();
    ctx.moveTo(px, GROUND_Y);
    ctx.lineTo(px - 4, GROUND_Y - 9);
    ctx.moveTo(px + 6, GROUND_Y);
    ctx.lineTo(px + 9, GROUND_Y - 8);
    ctx.stroke();
  }
}

function drawCloud(ctx, x, y) {
  ctx.beginPath();
  ctx.ellipse(x, y, 42, 16, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 34, y + 4, 30, 13, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 34, y + 5, 28, 12, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHills(ctx, scroll, baseY, amp, spacing) {
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = -spacing; x <= GAME_WIDTH + spacing; x += 20) {
    const px = x - (scroll % spacing);
    const y = baseY + Math.sin((px + scroll) * 0.012) * amp * 0.4 + Math.sin((px + scroll) * 0.004) * amp * 0.6;
    ctx.lineTo(px, y);
  }
  ctx.lineTo(GAME_WIDTH, GROUND_Y);
  ctx.closePath();
  ctx.fill();
}

function drawFarmhouse(ctx, x, y) {
  if (x < -220 || x > GAME_WIDTH + 40) return;
  ctx.fillStyle = '#a34a2a';
  ctx.fillRect(x, y, 170, 110);
  ctx.fillStyle = '#6e2f16';
  ctx.beginPath();
  ctx.moveTo(x - 14, y);
  ctx.lineTo(x + 85, y - 58);
  ctx.lineTo(x + 184, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffe9b0';
  ctx.fillRect(x + 24, y + 34, 26, 30);
  ctx.fillRect(x + 118, y + 34, 26, 30);
  ctx.fillStyle = '#5e2f16';
  ctx.fillRect(x + 72, y + 58, 28, 52);
  ctx.fillStyle = '#8a8a8a';
  ctx.fillRect(x + 128, y - 52, 20, 44);
}

function drawKitchenShed(ctx, x, y) {
  if (x < -260 || x > GAME_WIDTH + 40) return;
  /* A brick outdoor kitchen with a smoking chimney. */
  ctx.fillStyle = '#9c4a30';
  ctx.fillRect(x, y, 220, 122);
  for (let r = 0; r < 5; r++) {
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(x, y + 12 + r * 24, 220, 3);
  }
  ctx.fillStyle = '#5e2f16';
  ctx.fillRect(x - 10, y - 16, 240, 16);
  ctx.fillStyle = '#3a3a3f';
  ctx.fillRect(x + 170, y - 64, 26, 52);
  ctx.fillStyle = 'rgba(220, 220, 220, 0.55)';
  ctx.beginPath();
  ctx.ellipse(x + 183, y - 84, 12, 18, 0.2, 0, Math.PI * 2);
  ctx.ellipse(x + 190, y - 108, 16, 22, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffb347';
  ctx.fillRect(x + 30, y + 46, 60, 44);
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(x + 44, y + 60, 32, 18);
}

function drawPines(ctx, scroll, baseY) {
  ctx.fillStyle = '#2f5230';
  for (let i = 0; i < 7; i++) {
    const x = i * 170 - (scroll % 170);
    drawPine(ctx, x, baseY + 40, 150);
  }
}

function drawPine(ctx, x, baseY, h) {
  ctx.fillStyle = '#5e3a17';
  ctx.fillRect(x - 5, baseY - h * 0.25, 10, h * 0.25);
  ctx.fillStyle = '#2f5230';
  for (let i = 0; i < 3; i++) {
    const w = 64 - i * 16;
    const y = baseY - h * 0.25 - i * h * 0.28;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.lineTo(x, y - h * 0.32);
    ctx.lineTo(x + w / 2, y);
    ctx.closePath();
    ctx.fill();
  }
}

/* --- actors --- */

function drawTurkey(ctx, t, time) {
  const blink = turkeyIsInvulnerable(t, time * 1000) && Math.floor(time * 14) % 2 === 0;
  if (blink) ctx.globalAlpha = 0.35;

  const legSwing = Math.sin(t.runPhase) * (t.onGround ? 10 : 4);
  const bodyY = t.y + 26;
  const duck = t.ducking && t.onGround;

  ctx.save();
  ctx.translate(t.x + t.w / 2, bodyY);
  if (duck) ctx.scale(1.15, 0.72);

  /* Legs. */
  ctx.strokeStyle = PALETTE.turkeyBeak;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-8, 20);
  ctx.lineTo(-8 + legSwing, 30);
  ctx.moveTo(8, 20);
  ctx.lineTo(8 - legSwing, 30);
  ctx.stroke();

  /* Tail fan: five rust and amber feathers. */
  const featherColors = [PALETTE.featherRust, PALETTE.featherAmber, PALETTE.featherRust, PALETTE.featherAmber, PALETTE.featherRust];
  for (let i = 0; i < 5; i++) {
    const a = -0.9 + i * 0.45;
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = featherColors[i];
    ctx.beginPath();
    ctx.ellipse(-26, -6, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.turkeyDark;
    ctx.beginPath();
    ctx.ellipse(-40, -6, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* Body. */
  ctx.fillStyle = PALETTE.turkeyBody;
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  /* Wing. */
  ctx.fillStyle = PALETTE.turkeyDark;
  ctx.beginPath();
  ctx.ellipse(-2, -2, 18, 11, -0.3, 0, Math.PI * 2);
  ctx.fill();

  /* Neck and head. */
  ctx.fillStyle = PALETTE.turkeyHead;
  ctx.beginPath();
  ctx.ellipse(24, -20, 9, 16, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(30, -34, 11, 0, Math.PI * 2);
  ctx.fill();
  /* Beak and wattle. */
  ctx.fillStyle = PALETTE.turkeyBeak;
  ctx.beginPath();
  ctx.moveTo(38, -36);
  ctx.lineTo(50, -32);
  ctx.lineTo(38, -29);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.turkeyWattle;
  ctx.beginPath();
  ctx.ellipse(36, -26, 4, 7, 0.2, 0, Math.PI * 2);
  ctx.fill();
  /* Eye. */
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath();
  ctx.arc(32, -37, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawFarmer(ctx, world, time) {
  const gap = world.farmerGap;
  const x = TURKEY_X - 46 - gap * 1.5;
  if (x < -110) return;
  const legSwing = Math.sin(time * 16) * 12;
  const bob = Math.abs(Math.sin(time * 16)) * 3;

  ctx.save();
  ctx.translate(x + 30, GROUND_Y - 40 - bob);

  /* Legs. */
  ctx.strokeStyle = PALETTE.farmerOveralls;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(-8, 22);
  ctx.lineTo(-8 + legSwing, 40);
  ctx.moveTo(8, 22);
  ctx.lineTo(8 - legSwing, 40);
  ctx.stroke();

  /* Overalls and shirt. */
  ctx.fillStyle = PALETTE.farmerOveralls;
  ctx.fillRect(-16, -6, 32, 34);
  ctx.fillStyle = PALETTE.farmerShirt;
  ctx.fillRect(-16, -22, 32, 18);
  ctx.fillStyle = PALETTE.farmerOveralls;
  ctx.fillRect(-14, -22, 6, 18);
  ctx.fillRect(8, -22, 6, 18);

  /* Arm reaching forward with a pitchfork. */
  ctx.strokeStyle = PALETTE.farmerSkin;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(10, -14);
  ctx.lineTo(30, -6);
  ctx.stroke();
  ctx.strokeStyle = '#8a6d3b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(28, -34);
  ctx.lineTo(40, 26);
  ctx.stroke();
  ctx.strokeStyle = '#c0c8d4';
  ctx.lineWidth = 3;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(28 + i * 6, -34);
    ctx.lineTo(28 + i * 8, -48);
    ctx.stroke();
  }

  /* Head, beard, straw hat. */
  ctx.fillStyle = PALETTE.farmerSkin;
  ctx.beginPath();
  ctx.arc(0, -34, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8e0cc';
  ctx.beginPath();
  ctx.ellipse(0, -24, 11, 7, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = PALETTE.farmerHat;
  ctx.beginPath();
  ctx.ellipse(0, -42, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-11, -56, 22, 14);
  /* Angry eyes. */
  ctx.strokeStyle = '#1c1c1c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(2, -38);
  ctx.lineTo(9, -36);
  ctx.moveTo(16, -38);
  ctx.lineTo(10, -36);
  ctx.stroke();

  ctx.restore();
}

/* --- obstacles and corn --- */

function drawObstacles(ctx, world, time) {
  for (const ob of world.obstacles) {
    if (ob.kind === 'fence') drawFence(ctx, ob);
    if (ob.kind === 'hay') drawHay(ctx, ob);
    if (ob.kind === 'oven') drawOven(ctx, ob, time);
    if (ob.kind === 'knifeFall') drawFallingKnife(ctx, ob);
    if (ob.kind === 'knifeSwing') drawSwingKnife(ctx, ob);
  }
}

function drawFence(ctx, ob) {
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(ob.x, ob.y, 6, ob.h);
  ctx.fillRect(ob.x + ob.w - 6, ob.y, 6, ob.h);
  ctx.fillStyle = PALETTE.woodLight;
  ctx.fillRect(ob.x - 8, ob.y + 12, ob.w + 16, 8);
  ctx.fillRect(ob.x - 8, ob.y + 36, ob.w + 16, 8);
}

function drawHay(ctx, ob) {
  ctx.fillStyle = PALETTE.hay;
  ctx.beginPath();
  ctx.arc(ob.x + ob.w / 2, ob.y + ob.h / 2, ob.h / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.hayDark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(ob.x + ob.w / 2, ob.y + ob.h / 2, ob.h / 2 - 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(ob.x + ob.w / 2, ob.y + ob.h / 2, ob.h / 2 - 18, 0, Math.PI * 2);
  ctx.stroke();
}

function drawOven(ctx, ob, time) {
  /* Hot floor zone: glowing coals mark the danger on the ground. */
  const flicker = 0.7 + Math.sin(time * 9 + ob.x) * 0.3;
  ctx.fillStyle = 'rgba(255, 122, 26, ' + (0.25 * flicker) + ')';
  ctx.fillRect(ob.x, GROUND_Y - 6, ob.w, 10);
  ctx.fillStyle = PALETTE.ovenBody;
  ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
  ctx.fillStyle = '#232327';
  ctx.fillRect(ob.x + 10, ob.y + 8, ob.w - 20, 10);
  /* Fire mouth. */
  ctx.fillStyle = PALETTE.ovenFire;
  ctx.beginPath();
  ctx.ellipse(ob.x + ob.w / 2, ob.y + 48, 42, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.ovenGlow;
  ctx.beginPath();
  ctx.ellipse(ob.x + ob.w / 2, ob.y + 50, 26, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  /* Chimney with a wisp of smoke. */
  ctx.fillStyle = '#2c2c30';
  ctx.fillRect(ob.x + ob.w - 44, ob.y - 26, 24, 26);
  ctx.fillStyle = 'rgba(230, 230, 230, 0.5)';
  ctx.beginPath();
  ctx.ellipse(ob.x + ob.w - 30, ob.y - 40 - Math.sin(time * 2) * 3, 9, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HOT!', ob.x + ob.w / 2, ob.y - 8);
}

function drawFallingKnife(ctx, ob) {
  if (!ob.stuck) {
    /* Warning glint and shadow where it will land. */
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(ob.x + ob.w / 2, GROUND_Y + 4, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.save();
  ctx.translate(ob.x + ob.w / 2, ob.y + ob.h / 2);
  ctx.fillStyle = PALETTE.knifeBlade;
  ctx.beginPath();
  ctx.moveTo(0, -ob.h / 2);
  ctx.lineTo(9, -ob.h / 2 + 26);
  ctx.lineTo(9, ob.h / 2 - 26);
  ctx.lineTo(-9, ob.h / 2 - 26);
  ctx.lineTo(-9, -ob.h / 2 + 26);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.knifeHandle;
  ctx.fillRect(-8, ob.h / 2 - 28, 16, 26);
  ctx.restore();
}

function drawSwingKnife(ctx, ob) {
  /* Post with a rope; the blade swings at head height. */
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(ob.x - 4, ob.y, 8, ob.h);
  ctx.fillStyle = PALETTE.woodLight;
  ctx.fillRect(ob.x - 12, ob.y, 24, 10);
  const pivotX = ob.x + 2;
  const pivotY = ob.y + 8;
  const len = 95;
  const tipX = pivotX + Math.sin(ob.angle) * len;
  const tipY = pivotY + Math.cos(ob.angle) * len;
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();
  ctx.save();
  ctx.translate(tipX, tipY);
  ctx.rotate(ob.angle);
  ctx.fillStyle = PALETTE.knifeBlade;
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.lineTo(10, -6);
  ctx.lineTo(8, 22);
  ctx.lineTo(-8, 22);
  ctx.lineTo(-10, -6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.knifeHandle;
  ctx.fillRect(-8, 20, 16, 12);
  ctx.restore();
}

function drawCorns(ctx, world, time) {
  for (const c of world.corns) {
    const bobY = Math.sin(c.bob) * 3;
    ctx.save();
    ctx.translate(c.x, c.y + bobY);
    /* Husk leaves. */
    ctx.fillStyle = PALETTE.cornHusk;
    ctx.beginPath();
    ctx.moveTo(-12, 6);
    ctx.lineTo(-20, 14);
    ctx.lineTo(-6, 12);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, 6);
    ctx.lineTo(20, 14);
    ctx.lineTo(6, 12);
    ctx.closePath();
    ctx.fill();
    /* Cob. */
    ctx.fillStyle = PALETTE.corn;
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d9a400';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-6, -6);
    ctx.lineTo(6, -6);
    ctx.moveTo(-7, 0);
    ctx.lineTo(7, 0);
    ctx.moveTo(-6, 6);
    ctx.lineTo(6, 6);
    ctx.stroke();
    ctx.restore();
  }
}

/* --- HUD and screens --- */

function drawHUD(ctx, world) {
  ctx.fillStyle = PALETTE.hudBg;
  ctx.fillRect(0, 0, GAME_WIDTH, 52);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 19px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SCORE ' + world.score, 16, 32);
  const dist = Math.min(GOAL_DISTANCE_M, Math.floor(world.distanceM));
  ctx.fillText('DISTANCE ' + dist + ' m / ' + GOAL_DISTANCE_M + ' m', 250, 32);
  /* Lives as little drumsticks. */
  for (let i = 0; i < START_LIVES; i++) {
    const x = 560 + i * 34;
    drawDrumstick(ctx, x, 26, i < world.lives);
  }
  /* Farmer gap meter. */
  ctx.textAlign = 'right';
  ctx.fillText('FARMER', GAME_WIDTH - 150, 22);
  ctx.fillStyle = 'rgba(255, 233, 176, 0.3)';
  ctx.fillRect(GAME_WIDTH - 146, 30, 130, 10);
  const gapW = 130 * (world.farmerGap / 100);
  ctx.fillStyle = world.farmerGap < 30 ? '#e74c3c' : '#7bc043';
  ctx.fillRect(GAME_WIDTH - 146, 30, gapW, 10);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '13px sans-serif';
  ctx.fillText(world.farmerGap < 30 ? 'CLOSING IN!' : 'behind you', GAME_WIDTH - 16, 22);
  /* Zone label. */
  ctx.textAlign = 'left';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = PALETTE.titleAmber;
  ctx.fillText(ZONE_NAMES[zoneOf(world.distanceM)].toUpperCase(), 16, 74);
}

function drawDrumstick(ctx, x, y, alive) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alive ? 1 : 0.25;
  ctx.fillStyle = '#c98a4b';
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 8, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f5e6c8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(9, 4);
  ctx.lineTo(16, 10);
  ctx.stroke();
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawButton(ctx, x, y, w, h, label) {
  ctx.fillStyle = '#c0392b';
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.fillStyle = '#8e2318';
  roundRect(ctx, x, y + h - 8, w, 8, 6);
  ctx.fill();
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + h / 2 + 8);
}

function drawTitleScreen(ctx, world, time) {
  drawBackground(ctx, world, time);
  drawCorns(ctx, world, time);
  drawObstacles(ctx, world, time);

  /* A friendly turkey standing on the grass, farmer lurking left. */
  const demoTurkey = createTurkey();
  demoTurkey.x = 150;
  demoTurkey.runPhase = Math.sin(time * 3) * 0.2;
  drawTurkey(ctx, demoTurkey, time);
  drawFarmer(ctx, { farmerGap: 92 }, time);

  ctx.fillStyle = 'rgba(40, 22, 8, 0.45)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.titleAmber;
  ctx.font = 'bold 74px sans-serif';
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#5e2408';
  ctx.strokeText(GAME_TITLE, GAME_WIDTH / 2, 132);
  ctx.fillText(GAME_TITLE, GAME_WIDTH / 2, 132);
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(GAME_SUBTITLE, GAME_WIDTH / 2, 172);

  /* How to play card. */
  ctx.fillStyle = 'rgba(40, 22, 8, 0.78)';
  roundRect(ctx, GAME_WIDTH / 2 - 300, 200, 600, 132, 14);
  ctx.fill();
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '19px sans-serif';
  ctx.fillText('Thanksgiving morning. The farmer is coming for you.', GAME_WIDTH / 2, 232);
  ctx.fillText('Run to the woods — 1200 m — before he catches you.', GAME_WIDTH / 2, 260);
  ctx.fillText('Arrow keys / A D to run  •  SPACE to jump  •  DOWN to duck', GAME_WIDTH / 2, 288);
  ctx.fillText('Grab corn for points. Jump fences, hay and the oven.', GAME_WIDTH / 2, 312);

  drawButton(ctx, GAME_WIDTH / 2 - 130, 356, 260, 56, 'START RUN');
  if (Math.floor(time * 2) % 2 === 0) {
    ctx.fillStyle = '#ffe9b0';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('or press SPACE', GAME_WIDTH / 2, 448);
  }
}

function drawEndScreen(ctx, world, time) {
  drawBackground(ctx, world, time);
  ctx.fillStyle = 'rgba(30, 12, 4, 0.55)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  const escaped = world.escaped;
  ctx.textAlign = 'center';
  ctx.fillStyle = escaped ? '#7bc043' : '#e74c3c';
  ctx.font = 'bold 72px sans-serif';
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#2c1204';
  const headline = escaped ? 'ESCAPED!' : 'CAUGHT!';
  ctx.strokeText(headline, GAME_WIDTH / 2, 150);
  ctx.fillText(headline, GAME_WIDTH / 2, 150);

  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 24px sans-serif';
  if (escaped) {
    ctx.fillText('You made it to the woods. No Thanksgiving dinner today!', GAME_WIDTH / 2, 196);
  } else if (world.endReason === 'hit') {
    ctx.fillText('Three stumbles too many — the farmer scooped you up.', GAME_WIDTH / 2, 196);
  } else {
    ctx.fillText('The farmer caught up with you at the fence line.', GAME_WIDTH / 2, 196);
  }

  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '20px sans-serif';
  ctx.fillText('Distance: ' + Math.floor(world.distanceM) + ' m    •    Corn: ' + world.cornCollected + '    •    Score: ' + world.score, GAME_WIDTH / 2, 240);

  if (escaped) {
    ctx.font = '19px sans-serif';
    ctx.fillText('Play again and beat your score — the farmer is faster next time.', GAME_WIDTH / 2, 272);
  }

  drawButton(ctx, GAME_WIDTH / 2 - 130, 310, 260, 56, 'RUN AGAIN');
  if (Math.floor(time * 2) % 2 === 0) {
    ctx.fillStyle = '#ffe9b0';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('or press R', GAME_WIDTH / 2, 402);
  }
}
