import { APIGatewayEvent } from 'aws-lambda';
import { imageService, responseService } from '../dependencies';
import BadRequestError from '../errors/BadRequestError';
import { acceptsHtml, formatHeaders, parseRequest } from '../services/html-service';
import imageTemplate from '../templates/imageTemplate';

export default async function uploadImage(event: APIGatewayEvent) {
  const headers = formatHeaders(event.headers);

  try {
    const image = await parseRequest(event);

    const { location, thumbnails } = await imageService.resizeAndUpload(image);

    if (acceptsHtml(headers)) {
      return responseService.ok(imageTemplate(location), 200, { 'content-type': 'text/html' });
    }

    return responseService.ok({ location, thumbnails });
  } catch (err) {
    if (err instanceof BadRequestError) {
      return responseService.badRequest(err);
    }

    throw err;
  }
}
