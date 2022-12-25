import * as core from '@actions/core';
import detectNewCircularDependencies from './validate-circular-deps';

async function run() {
  try {
    const baseFilePath = core.getInput('baseFilePath');
    if (!baseFilePath) {
      core.info('baseFilePath not specified');
    } else {
      core.info(`baseFilePath:: ${baseFilePath}`);
    }
    await detectNewCircularDependencies({
      baseCircularDependencies: [],
    });
  } catch (error) {
    core.setFailed(error.message);
    core.setFailed('✖ Failed!');
    process.exitCode = 2;
  }
}

run();
