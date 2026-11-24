#!/usr/bin/env node
/** W1 language + HUD screenshots — Playwright, port 8111. */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const base = process.argv[2] || 'http://localhost:8111/';
const outDir = process.argv[3] || 'test-output/v3/w1';

const shots = [];
const consoleIssues = [];

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

async function snap(page, name) {
  const file = path.join(outDir, name);
  await page.screenshot({ path: file, fullPage: false });
  shots.push(file);
}

async function runLang(page, lang) {
  await page.addInitScript((code) => {
    localStorage.setItem('dd.lang.v3', code);
  }, lang);
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
}

async function main() {
  ensureDir(outDir);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  page.on('console', (msg) => {
    const t = msg.type();
    if (t === 'error' || t === 'warning') consoleIssues.push(`${t}: ${msg.text()}`);
  });
  page.on('pageerror', (e) => consoleIssues.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (req) => {
    if (req.url().includes('/assets/')) consoleIssues.push(`404?: ${req.url()}`);
  });

  await runLang(page, 'zh');
  await snap(page, '01_title_zh.png');
  await page.click('#btn-start');
  await page.waitForTimeout(300);
  await snap(page, '02_disclaimer_zh.png');
  await page.click('#btn-disclaimer');
  await page.waitForTimeout(400);
  await snap(page, '03_select_zh.png');

  await page.evaluate(() => window.__debug.startFight('glm'));
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const p = window.__game.player;
    if (p) {
      p.gpuCooldowns = { rtx5090: 0, h200: 4.2, b200: 12.5 };
    }
  });
  await page.waitForTimeout(200);
  await snap(page, '04_fight_gpu_cd_zh.png');

  await page.keyboard.press('KeyP');
  await page.waitForTimeout(200);
  await snap(page, '05_debug_zh.png');

  await runLang(page, 'en');
  await snap(page, '06_title_en.png');
  await page.click('#btn-start');
  await page.waitForTimeout(250);
  await snap(page, '07_disclaimer_en.png');
  await page.click('#btn-disclaimer');
  await page.waitForTimeout(350);
  await snap(page, '08_select_en.png');
  await page.evaluate(() => window.__debug.startFight('deepseek'));
  await page.waitForTimeout(600);
  await snap(page, '09_fight_en.png');

  await browser.close();

  const report = [
    `url: ${base}`,
    `screenshots: ${shots.length}`,
    ...shots.map((p) => `  ${p}`),
    `console issues: ${consoleIssues.length}`,
    ...consoleIssues.map((x) => `  ${x}`),
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'report.txt'), `${report}\n`);
  console.log(report);
  if (consoleIssues.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});