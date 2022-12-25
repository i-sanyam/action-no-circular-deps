async function run() {
  console.log('Hello world!');
  try {
    const baseFilePath = core.getInput('baseFilePath');
    if (!baseFilePath) {
      core.info('baseFilePath not specified');
    }
    core.info(`baseFilePath:: ${baseFilePath}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
