#!/usr/bin/env node
import kleur from 'kleur';
import { run } from '../src/cli.js';

run().catch((err) => {
  console.error(kleur.red(err.stack || err.message || err));
  process.exit(1);
});
