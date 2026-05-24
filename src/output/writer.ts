import fs from 'fs';
import path from 'path';
import { OutputOptions } from './types';

export function writeToFile(content: string, filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

export function writeToStdout(content: string): void {
  process.stdout.write(content + '\n');
}

export function appendToFile(content: string, filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf-8');
    fs.writeFileSync(filePath, content + '\n' + existing, 'utf-8');
  } else {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

export function handleOutput(content: string, options: OutputOptions): void {
  if (options.stdout) {
    writeToStdout(content);
    return;
  }
  if (options.append && options.filePath) {
    appendToFile(content, options.filePath);
    return;
  }
  if (options.filePath) {
    writeToFile(content, options.filePath);
  }
}
