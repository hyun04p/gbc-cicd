#!/usr/bin/env node

import express from 'express';
import fs from 'fs';
import AuthRouter from './auth';
import BuildRouter from './build';
import os from 'os';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const MODE = process.argv[2] === undefined ? 'run' : process.argv[2]; // run | reset
const PORT = parseInt(process.argv[3] === undefined ? '5000' : process.argv[3]);
const configDirPath =
  process.argv[4] === undefined ? `${os.homedir()}/gbc` : `${process.argv[4]}`;
const configFilePath = `${configDirPath}/gbc.config.json`;

if (MODE === 'reset' || !fs.existsSync(configDirPath)) {
  fs.rmSync(configDirPath, { recursive: true, force: true });
  fs.rmSync(`${configDirPath}/log`, { recursive: true, force: true });
  fs.mkdirSync(configDirPath);
  fs.mkdirSync(`${configDirPath}/log`);
  fs.closeSync(fs.openSync(configFilePath, 'w'));
  fs.writeFileSync(
    configFilePath,
    `{
  "password": "test",
  "logFilePath": "${path.join(configDirPath, 'log')}",
  "buildScriptPath": "${path.join(configDirPath, 'build.sh')}"
}`
  );
  fs.writeFileSync(
    `${path.join(configDirPath, 'build.sh')}`,
    `#!/bin/bash 

echo "Hi GBC~"
sleep 5
echo "done"
  `
  );
}

const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

let appState = {
  isBuilding: false,
  authToken: null,
  loginAttempts: 0,
};

app.use('/auth', AuthRouter);
app.use('/build', authMiddleWare, BuildRouter);

app.use('/', express.static('dist/static'));

function authMiddleWare(req, res, next) {
  if (
    appState.authToken !== null &&
    req.header('gaebokchi-token') === appState.authToken
  ) {
    next();
  } else {
    res.json({
      message: 'unauthorized',
    });
    return;
  }
}

app.listen(PORT, () => {
  console.log(
    `GBC CICD Server Listening to Port: ${PORT}\nInitial Password: ${config.password}`
  );
});

export { config, appState };
