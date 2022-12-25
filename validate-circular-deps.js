import assert from 'assert';
import childProcess from 'child_process';
import lodash from 'lodash';
import madge from 'madge';
import util from 'util';
import { promises as fsPromises } from 'fs';
import { logError, CLI_COLOR } from './log.js';

const { isEqual } = lodash;
const { writeFile } = fsPromises;

const exec = util.promisify(childProcess.exec);

const getCurrentGitBranchName = async () => {
  try {
    const { stdout } = await exec('git rev-parse --abbrev-ref HEAD');
    if (typeof stdout === 'string') {
      const gitBranchName = stdout.trim();
      return gitBranchName.replace(/\\|\//g, '-');
    }
    throw new Error('Unable to get branch name');
  } catch (e) {
    // warn error here
    return 'yourBranch';
  }
};

const generateStringForNumber = (num = 1, options = {}) => {
  const { baseLength = 5, radix = 36 } = options;
  let str = num.toString(radix);
  if (str.length < baseLength) {
    str = new Array(baseLength - str.length + 1).join('0') + str;
  }
  return str;
};

const generateCircularDependenciesLogFile = async (circularDependencies, fileName) => {
  const fileNameToUse = !fileName ? await getCurrentGitBranchName() : fileName;
  const randomString = generateStringForNumber(new Date().getTime());
  const fileToWrite = `./circular-deps-logs/${fileNameToUse}CircularDeps_${randomString}.json`;
  await writeFile(fileToWrite, JSON.stringify(circularDependencies));
  return fileToWrite;
};

const getCircularDependencies = async (path) => {
  const result = await madge(path);
  const circularDependencies = result.circular();
  return circularDependencies;
};

const detectNewCircularDependencies = async (params) => {
  const {
    baseCircularDependencies: baseCircularDeps = [],
    path,
  } = params;

  assert(path, 'path is required');

  const branchCircularDeps = await getCircularDependencies(path);

  if (branchCircularDeps.length === baseCircularDeps.length
    && isEqual(baseCircularDeps, branchCircularDeps)) {
    return { newCircularDependencies: [], branchCircularDeps };
  }

  const newCircularDependencies = [];
  for (const newDependency of branchCircularDeps) {
    const existingDependency = baseCircularDeps.find((d) => isEqual(d, newDependency));
    if (!existingDependency) {
      newCircularDependencies.push(newDependency);
      logError(CLI_COLOR.FgRed, 'error', CLI_COLOR.Reset, newDependency.toString(), CLI_COLOR.FgGray, 'new-circular-dependency');
    }
  }

  return { newCircularDependencies, branchCircularDeps };
};

export { detectNewCircularDependencies, generateCircularDependenciesLogFile };
