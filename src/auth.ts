import express from 'express';
import sha256 from './sha256.js';
import { config, appState } from './server';
var AuthRouter = express.Router();

const NACL = 'NACL';

AuthRouter.post('/', (req, res) => {
  if (sha256(config.password + NACL) === req.body.pw) {
    appState.loginAttempts = 0;
    const now = new Date();
    let token = sha256(now.toISOString() + req.body.token + NACL);
    appState.authToken = token;
    setTimeout(() => {
      appState.authToken = null;
    }, 600000);
    res.json({
      token,
    });
    return;
  } else if (appState.loginAttempts < 10) {
    appState.loginAttempts++;
    res.json({
      message: 'fail',
      attempt: appState.loginAttempts,
    });
    return;
  } else {
    res.json({
      message: 'exceed',
    });
    return;
  }
});

export default AuthRouter;
