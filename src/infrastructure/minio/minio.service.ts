import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class MinioService {
  private readonly s3Client: S3Client;
  private readonly bucket = 'content';

  constructor() {
    // const endpoint = `${process.env.BASE_URL_FILES_STORAGE}:${process.env.MINIO_API_PORT}`;
    const endpoint = process.env.MINIO_ENDPOINT ?? 'http://minio:9000';
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint,
      credentials: {
        accessKeyId: process.env.MINIO_ROOT_USER,
        secretAccessKey: process.env.MINIO_ROOT_PASSWORD,
      },
      forcePathStyle: true,
    });
  }

  async uploadObject(key: string, buffer: Buffer, contentType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
  }

  async getObjectStream(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    return response.Body as Readable;
  }

  getBucket(): string {
    return this.bucket;
  }

  async uploadFile(bucket: string, key: string, body: Readable | Buffer, contentType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
  }

  async copyObject(sourceKey: string, destinationKey: string): Promise<void> {
    const copySource = `/${this.bucket}/${sourceKey}`;

    const command = new CopyObjectCommand({
      Bucket: this.bucket,
      CopySource: copySource,
      Key: destinationKey,
    });

    await this.s3Client.send(command);
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }
}
