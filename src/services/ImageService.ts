import ImageResizer, { ResizeImageOptions } from './ImageResizer';
import ImageUploader, { UploadImageOptions } from './ImageUploader';

export type ResizeAndUploadOptions = ResizeImageOptions & UploadImageOptions;

export interface Thumbnail {
  size: number;
  location: string;
}

export default class ImageService {
  constructor(private readonly imageResizer: ImageResizer, private readonly imageUploader: ImageUploader) {}

  async resizeAndUpload({ imagePath, imageName, imageMimeType, size }: ResizeAndUploadOptions) {
    const [resizedImage, thumbnails] = await Promise.all([
      this.getResizedImage({ imagePath, imageName, imageMimeType, size }),
      this.generateThumbnails({ imagePath, imageName, imageMimeType }, 96)
    ]);

    return {
      location: resizedImage,
      thumbnails
    };
  }

  private async generateThumbnails(
    { imagePath, imageName, imageMimeType }: Omit<ResizeAndUploadOptions, 'size'>,
    ...sizes: number[]
  ): Promise<Thumbnail[]> {
    return Promise.all(
      sizes.map(async size => {
        imageName = `${imageName}_${size}`;
        const location = await this.getResizedImage({ imagePath, imageName, imageMimeType, size });

        return { size, location };
      })
    );
  }

  private async getResizedImage({ imagePath, imageName, imageMimeType, size }: ResizeAndUploadOptions) {
    imagePath = await this.imageResizer.resizeImage({ imagePath, imageMimeType, size });

    return this.imageUploader.uploadImage({ imagePath, imageName, imageMimeType });
  }
}
