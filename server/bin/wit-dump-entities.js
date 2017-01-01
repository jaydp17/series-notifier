// @flow

import fs from 'fs';
import path from 'path';
import Promise from 'bluebird';
import request from 'request-promise';

const entityName = process.argv[2];
if (!entityName) {
  console.info('Usage: Pass the Entity name as the argument'); // eslint-disable-line no-console
  process.exit(0);
}

const token: string = process.env.WITAI_TOKEN || '';
if (!token) {
  console.error('Pass WITAI_TOKEN as an env variable'); // eslint-disable-line no-console
  process.exit(1);
}

/**
 * Escapes Quotes & double Quotes in a string
 * @param str String to replace
 */
function addSlashes(str: string): string {
  return (`${str}`).replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

/**
 * Downloads the Entity information from Wit.AI
 */
async function dump(): Promise<Array<Object>> {
  const res = await request({
    url: `https://api.wit.ai/entities/${entityName}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    json: true,
  });
  return res.values;
}

/**
 * Generates Javascript content contain the data
 * @param values Values returned from Wit.AI
 */
function generateFileContent(values: Array<Object>): string {
  let outputStr = '';
  for (const obj of values) {
    const objValue = addSlashes(obj.value);
    const objExpressions = obj.expressions.map(v => addSlashes(v));
    outputStr += '  {\n'
      + `    value: '${objValue}',\n`
      + `    expressions: [ '${objExpressions.join('\', \'')}' ],\n  },\n`;
  }
  return `export default [\n${outputStr}];\n`;
}

/**
 * Writes the content to a file
 * @param content
 */
function writeToFile(content: string): Promise<any> {
  const dirName = 'wit-dump';
  const dirPath = path.resolve(__dirname, dirName);

  // create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  // write the content to file
  const fileName = path.resolve(__dirname, `${dirName}/${entityName}-dump.js`);
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, content, (err) => {
      if (err) return reject(err);
      return resolve();
    });
  });
}

/**
 * Main Execution
 */
async function main() {
  const values = await dump();
  const content = generateFileContent(values);
  await writeToFile(content);
  console.log('done!'); // eslint-disable-line no-console
}

main();
