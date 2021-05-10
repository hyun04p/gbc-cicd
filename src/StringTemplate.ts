import path from 'path';
import chalk from 'chalk';

const PREFIX = chalk.yellow('[GBC]');

const initialConfig: (
  logFilePath: string,
  buildFilePath: string,
  webhookSecret: string
) => string = (logFilePath, buildFilePath, webhookSecret) => {
  return `{
    "password": "test",
    "webhookSecret": "${webhookSecret}",
    "logFilePath": "${logFilePath}",
    "buildScriptPath": "${buildFilePath}"
  }`;
};

const initialBuildScript: () => string = () => {
  return `#!/bin/bash

  echo "Hi GBC~"
  sleep 5
  echo "done"`;
};

const welcomeMsg: (
  port: number,
  initPassword: string,
  configDirPath: string,
  webhookSecret: string
) => string = (port, initPassword, configDirPath, webhookSecret) => {
  return `${PREFIX} GBC CICD Server Listening to Port: ${port}
${PREFIX} Initial Password: ${initPassword}
${PREFIX} To change password, edit ${path.join(
    configDirPath,
    'gbc.config.json'
  )}
${PREFIX} Github Webhook available at /build/github-webhook
${PREFIX} Webhook Secret: ${webhookSecret}`;
};

export { initialConfig, initialBuildScript, welcomeMsg };
