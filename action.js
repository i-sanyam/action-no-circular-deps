import * as core from '@actions/core';

async function run() {
  try {
    const baseFilePath = core.getInput('baseFilePath');
    if (!baseFilePath) {
      core.info('baseFilePath not specified');
    } else {
      core.info(`baseFilePath:: ${baseFilePath}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
