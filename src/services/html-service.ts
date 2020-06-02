import { APIGatewayEvent } from 'aws-lambda';
import crypto from 'crypto';
import { File, IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { IncomingHttpHeaders, IncomingMessage } from 'http';
import os from 'os';
import path from 'path';
import { Readable } from 'stream';
import BadRequestError from '../errors/BadRequestError';
import { ResizeAndUploadOptions } from './ImageService';

/** Format headers to set every key to lowercase */
export function formatHeaders(headers: object = {}): IncomingHttpHeaders {
  return Object.fromEntries(Object.entries(headers).map(([key, val]) => [key.toLowerCase(), val]));
}

/** Check if the headers include a `multipart/form-data` `content-type` */
export function isMultipart(headers: IncomingHttpHeaders): boolean {
  return !!headers['content-type']?.toLowerCase().includes('multipart/form-data');
}

/** Check if the headers include an image `content-type` */
export function isImage(headers: IncomingHttpHeaders): boolean {
  const contentType = headers['content-type']?.toLowerCase();

  if (!contentType) {
    return false;
  }

  return allowedTypes.some(allowedType => contentType.includes(allowedType));
}

/** Check if the headers include the request `accepts` a `text/html`  response */
export function acceptsHtml(headers: IncomingHttpHeaders): boolean {
  return !!headers.accept?.toLowerCase().includes('text/html');
}

/** Parses a binary o multipart request indistinctly */
export async function parseRequest(event: APIGatewayEvent): Promise<ResizeAndUploadOptions> {
  const headers = formatHeaders(event.headers);

  if (isMultipart(headers)) {
    return parseFormRequest(event);
  }

  if (isImage(headers)) {
    return parseBinaryRequest(event);
  }

  throw new BadRequestError('Unsupported content-type');
}

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml', 'image/gif', 'image/webp'];

/**
 * Parse a `multipart/form-data` request. It expects to have:
 *  * A mandatory `image` file field
 *  * An optional `resizeTo` numeric field greater than or equal to `128`. Defaults to 128 when to present
 */
export async function parseFormRequest(event: APIGatewayEvent): Promise<ResizeAndUploadOptions> {
  // Parse a api gateway event like a form https://stackoverflow.com/a/43286871/2535616
  return new Promise((resolve, reject) => {
    const { body } = event;
    const headers = formatHeaders(event.headers) as any;

    event.headers = { ...headers };

    if (body && typeof body.length !== 'undefined') {
      headers['content-length'] = body.length;
    }

    const form = new IncomingForm({ hash: 'sha256' } as any);
    const stream = new Readable();

    stream.push(body, 'base64');
    stream.push(null);

    Object.assign(stream, { headers });

    form.on('fileBegin', (name: string, file: File) => {
      if (name !== 'image') {
        stream.emit('error', new BadRequestError(`Invalid form field "${name}"`));
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        stream.emit('error', new BadRequestError(`Mime type "${file.type}" not allowed. Must be one of ${allowedTypes.join(', ')}`));
        return;
      }
    });

    form.on('field', (name, value) => {
      if (name !== 'resizeTo') {
        stream.emit('error', new BadRequestError(`Invalid form field "${name}"`));
        return;
      }

      try {
        parseResizeTo(value);
      } catch (err) {
        stream.emit('error', err);
      }
    });

    form.once('error', reject);

    form.parse(stream as IncomingMessage, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      if (!files.image) {
        reject(new BadRequestError('Missing required form field "image"'));
        return;
      }

      resolve({
        size: parseResizeTo(fields.resizeTo as string),
        imageMimeType: files.image.type,
        imageName: files.image.hash!,
        imagePath: files.image.path
      });
    });
  });
}

async function parseBinaryRequest(event: APIGatewayEvent): Promise<ResizeAndUploadOptions> {
  const resizeTo = parseResizeTo(event.queryStringParameters?.resizeTo);

  const headers = formatHeaders(event.headers);
  const image = Buffer.from(event.body!, 'base64');

  const hash = crypto.createHash('sha256').update(image).digest('hex');

  const destination = path.join(os.tmpdir(), crypto.randomBytes(16).toString('hex'));
  await fs.writeFile(destination, image);

  return {
    size: resizeTo,
    imageMimeType: headers['content-type']!,
    imageName: hash,
    imagePath: destination
  };
}

const RESIZE_TO_LOWER_LIMIT = 128;
const RESIZE_TO_UPPER_LIMIT = 1920;

function parseResizeTo(resizeTo: string | number = RESIZE_TO_LOWER_LIMIT): number {
  resizeTo = Number(resizeTo);

  if (!Number.isFinite(resizeTo) || resizeTo < RESIZE_TO_LOWER_LIMIT || resizeTo > RESIZE_TO_UPPER_LIMIT) {
    throw new BadRequestError(`"resizeTo" must be between ${RESIZE_TO_LOWER_LIMIT} - ${RESIZE_TO_UPPER_LIMIT}`);
  }

  return resizeTo;
}
