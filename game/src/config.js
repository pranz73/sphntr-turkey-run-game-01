'use strict';
/* Gobble Dash — every tunable number in one place.
   A 2D canvas runner: a turkey flees the farmyard toward the woods,
   outrunning the farmer, jumping fences and hay bales, dodging the
   outdoor oven and falling and swinging carving knives, grabbing corn. */

/* Canvas and ground. */
const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const GROUND_Y = 452;

/* Turkey physics. */
const TURKEY_X = 180;
const TURKEY_W = 64;
const TURKEY_H = 58;
const TURKEY_DUCK_H = 38;
const GRAVITY = 2100;
const JUMP_VELOCITY = -780;

/* Run speed in pixels per second; ramps with distance. */
const BASE_SPEED = 250;
const MAX_SPEED = 430;
const SPRINT_BONUS = 70;
const SLOW_PENALTY = 80;

/* World. */
const GOAL_DISTANCE_M = 1200;
const PX_PER_METER = 4;
const START_LIVES = 3;
const CORN_SCORE = 10;

/* The farmer: gap 0..100. Sprinting widens it, stumbling closes it. */
const FARMER_GAP_START = 100;
const FARMER_GAP_STUMBLE_LOSS = 22;
const FARMER_GAP_DRIFT_PER_S = 1.6;
const FARMER_GAP_SPRINT_GAIN_PER_S = 6;

/* How long the turkey flashes invulnerable after a hit. */
const INVULNERABLE_MS = 1300;

/* Spawning: gap in pixels between obstacle groups, shrinks with distance. */
const SPAWN_GAP_MIN = 300;
const SPAWN_GAP_MAX = 560;

/* Zones along the run, by distance in metres. */
const ZONE_FARMYARD_END = 400;
const ZONE_KITCHEN_END = 800;

/* Autumn palette. */
const PALETTE = {
  skyTop: '#f7c873',
  skyMid: '#f2a65a',
  skyBottom: '#e07b39',
  sun: '#fff3c4',
  hillFar: '#7d8f4a',
  hillNear: '#5d7a35',
  grass: '#6f9a3e',
  dirt: '#8a5a2b',
  dirtDark: '#6e4520',
  wood: '#7a4a21',
  woodLight: '#9c6b32',
  hay: '#e0a83c',
  hayDark: '#b57f22',
  ovenBody: '#3a3a3f',
  ovenFire: '#ff7a1a',
  ovenGlow: '#ffb347',
  knifeBlade: '#dfe6ee',
  knifeHandle: '#4a2c14',
  corn: '#ffd23f',
  cornHusk: '#4e8f2f',
  turkeyBody: '#8a5a2b',
  turkeyDark: '#5e3a17',
  turkeyHead: '#c98a4b',
  turkeyWattle: '#c0392b',
  turkeyBeak: '#e67e22',
  featherRust: '#b4552d',
  featherAmber: '#d98e32',
  farmerShirt: '#b03a2e',
  farmerOveralls: '#2e5a8a',
  farmerHat: '#d9b36c',
  farmerSkin: '#e8b98a',
  hudBg: 'rgba(40, 22, 8, 0.72)',
  hudText: '#ffe9b0',
  titleAmber: '#ffb347',
  titleRust: '#c0392b',
};

/* Names shown on screen. Keep them original. */
const GAME_TITLE = 'GOBBLE DASH';
const GAME_SUBTITLE = "A Turkey's Great Escape";
const ZONE_NAMES = ['Farmyard', 'Kitchen Yard', 'Woods Edge'];
