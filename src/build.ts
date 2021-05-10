import express from 'express';
import * as fs from 'fs';
import child_process from 'child_process';
import { config, appState } from './server';

let BuildRouter = express.Router();
let currentBuild = '';

function build() {
  appState.isBuilding = true;

  const now = new Date();
  currentBuild = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.txt`;
  const currentBuildLog = `${config.logFilePath}/${currentBuild}`;

  fs.closeSync(fs.openSync(currentBuildLog, 'w'));

  child_process.exec(
    `sh ${config.buildScriptPath} > ${currentBuildLog}`,
    (error, stdout, stderr) => {
      appState.isBuilding = false;
    }
  );
}

BuildRouter.post('/github-webhook', (req, res) => {
  if (appState.isBuilding) {
    res.status(200);
    return;
  }
  build();
  res.status(200);
});

BuildRouter.get('/trigger', (req, res) => {
  if (appState.isBuilding) {
    res.json({ message: 'already building' });
    return;
  }
  build();
  res.status(200).json({ message: 'start building' });
});

BuildRouter.get('/log', (req, res) => {
  const currentBuildLog = `${config.logFilePath}/${currentBuild}`;
  res.json({
    log: currentBuild === '' ? '' : fs.readFileSync(currentBuildLog, 'utf-8'),
    buildId: currentBuild,
  });
});

BuildRouter.get('/status', (req, res) => {
  res.json({ status: appState.isBuilding ? 'BUILDING' : 'IDLE' });
});

export default BuildRouter;
