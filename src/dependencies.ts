import S3 from 'aws-sdk/clients/s3';
import ImageResizer from './services/ImageResizer';
import ImageService from './services/ImageService';
import ImageUploader from './services/ImageUploader';
import ResponseService from './services/ResponseService';

export const SERVERLESS_ENV = process.env.SERVERLESS_ENV ?? 'dev';
export const IMAGES_BUCKET_NAME = process.env.IMAGE_BUCKET ?? 'lambda-image-resizer';

export const responseService = new ResponseService();

export const s3 = new S3();

export const imageUploader = new ImageUploader(s3, IMAGES_BUCKET_NAME, SERVERLESS_ENV);

export const imageResizer = new ImageResizer();

export const imageService = new ImageService(imageResizer, imageUploader);
