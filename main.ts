import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { buildDossier } from './vendor/makefun-game.ts';

/* Gobble Dash entrypoint: copy game/ and screenshots/ into the output
   directory and write the dossier buildDossier computes from them.
   The output directory is a provided mount in the grader: create it,
   never remove it. Standard library only, Node 22. */

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
cpSync('game', `${outDir}/game`, { recursive: true });
cpSync('screenshots', `${outDir}/screenshots`, { recursive: true });
writeFileSync(
  `${outDir}/dossier.json`,
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
  }),
);
