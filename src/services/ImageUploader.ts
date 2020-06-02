import S3 from 'aws-sdk/clients/s3';
import { createReadStream } from 'fs';

export interface UploadImageOptions {
  imagePath: string;
  imageName: string;
  imageMimeType: string;
}

export default class ImageUploader {
  constructor(private readonly s3: S3, private readonly bucketName = 'images', private readonly folder?: string) {
    this.folder = this.folder?.replace(/\/+/, '');
  }

  async uploadImage({ imagePath, imageName, imageMimeType }: UploadImageOptions): Promise<string> {
    imageName = this.folder ? `${this.folder}/${imageName}` : imageName;

    const { Location } = await this.s3
      .upload({
        Bucket: this.bucketName,
        Body: createReadStream(imagePath),
        Key: imageName,
        ContentType: imageMimeType
      })
      .promise();

    return Location;
  }
}
