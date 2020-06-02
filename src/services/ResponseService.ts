import { IncomingHttpHeaders } from 'http';
import BadRequestError from '../errors/BadRequestError';

export default class ResponseService {
  ok(body: any, statusCode?: number, headers?: IncomingHttpHeaders) {
    return this.response(body, statusCode, headers);
  }

  badRequest(err: BadRequestError) {
    return this.response({ statusCode: 400, error: 'Bad Request', message: err.message }, 400);
  }

  private response(body: any, statusCode = 200, headers: IncomingHttpHeaders = { 'content-type': 'application/json' }): Response<string> {
    if (headers['content-type']?.includes('application/json')) {
      body = JSON.stringify(body);
    }

    Object.assign(headers, {
      'access-control-allow-origin': '*',
      'access-control-allow-credentials': 'true'
    });

    return { statusCode, body, headers };
  }
}

export interface Response<Body> {
  statusCode: number;
  body: Body;
  headers?: IncomingHttpHeaders;
}
