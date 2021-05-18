#!/usr/bin/env node

import express from 'express';
import * as fs from 'fs';
import AuthRouter from './auth';
import BuildRouter from './build';
import os from 'os';
import path from 'path';
import * as setup from './Setup';
import * as strTemplate from './StringTemplate';
import sha256 from './sha256';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const MODE = process.argv[2] === undefined ? 'run' : process.argv[2]; // run | reset
const PORT = parseInt(process.argv[3] === undefined ? '5000' : process.argv[3]);
const configDirPath =
  process.argv[4] === undefined ? `${os.homedir()}/gbc` : `${process.argv[4]}`;
const configFilePath = `${configDirPath}/gbc.config.json`;

if (
  MODE === 'reset' ||
  !fs.existsSync(configDirPath) ||
  !fs.existsSync(configFilePath)
) {
  setup.initConfigDir(configDirPath);
}

const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

let appState = {
  isBuilding: false,
  authToken: null,
  loginAttempts: 0,
};

app.use('/auth', AuthRouter);
app.use('/build', authMiddleWare, BuildRouter);
app.use('/', express.static(path.join(__dirname, '/static')));

function authMiddleWare(req, res, next) {
  if (
    req.header('X-GitHub-Event') !== undefined ||
    (appState.authToken !== null &&
      req.header('gaebokchi-token') === appState.authToken)
  ) {
    next();
  } else {
    res.json({
      message: 'unauthorized',
    });
    return;
  }
}

function logMiddleware(req, res, next) {}

app.listen(PORT, () => {
  console.log(
    strTemplate.welcomeMsg(
      PORT,
      config.password,
      configDirPath,
      config.webhookSecret
    )
  );
});

export { config, appState };
