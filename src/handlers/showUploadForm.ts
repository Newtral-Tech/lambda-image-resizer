import { promises as fs } from 'fs';
import path from 'path';
import { responseService } from '../dependencies';

const INDEX_FILE = path.join(__dirname, '../../index.html');

export default async function showUploadForm() {
  const file = await fs.readFile(INDEX_FILE, 'utf-8');

  return responseService.ok(file, 200, { 'content-type': 'text/html' });
}
