import { getExtension } from 'mime';
import sharp from 'sharp';

export interface ResizeImageOptions {
  imagePath: any;
  imageMimeType: string;
  size: number;
}

export default class ImageResizer {
  async resizeImage({ imagePath, imageMimeType, size }: ResizeImageOptions) {
    const destination = this.getDestination(imagePath, imageMimeType, size);

    await sharp(imagePath).resize({ height: size, width: size, fit: 'inside' }).toFile(destination);

    return destination;
  }

  private getDestination(imagePath: string, imageMimeType: string, size: number) {
    const extension = this.getOutputExtension(imageMimeType);

    return `${imagePath}_${size}.${extension}`;
  }

  private getOutputExtension(imageMimeType: string) {
    let extension = getExtension(imageMimeType);

    if (extension === 'webp') {
      extension = 'webp';
    } else if (extension === 'png' || extension === 'gif' || extension === 'svg') {
      extension = 'png';
    } else {
      extension = 'jpg';
    }

    return extension;
  }
}
