import * as fs from 'fs';
import path from 'path';
import sha256 from './sha256.js';
import * as strTemplate from './StringTemplate';

const initConfigDir = (configDirPath: string) => {
  const configFilePath = path.join(configDirPath, '/gbc.config.json');
  const webhookSecret = sha256(new Date().toISOString());

  fs.rmSync(configDirPath, { recursive: true, force: true });
  fs.mkdirSync(configDirPath);

  !fs.existsSync(`${configDirPath}/log`) &&
    fs.mkdirSync(`${configDirPath}/log`);

  fs.closeSync(fs.openSync(configFilePath, 'w'));
  fs.writeFileSync(
    configFilePath,
    strTemplate.initialConfig(
      path.join(configDirPath, 'log'),
      path.join(configDirPath, 'build.sh'),
      webhookSecret
    )
  );
  fs.writeFileSync(
    `${path.join(configDirPath, 'build.sh')}`,
    strTemplate.initialBuildScript()
  );
};

export { initConfigDir };
