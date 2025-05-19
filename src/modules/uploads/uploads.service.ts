import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as fs from 'fs';
import * as path from 'path';
import Redis from 'ioredis';
import { UploadDto } from './upload.dto';
import { UPLOAD_STATUS } from '../common/constants';
@Injectable()
export class UploadsService {
  private readonly redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  });

  constructor(@InjectQueue('videoQueue') private readonly queue: Queue) {}
  async assembleAndQueue(fileId: string, totalChunks: number, originalName: string, body: UploadDto, userId: string) {
    const chunkDir = `/app/tmp/uploads/${fileId}`;
    const finalFileName = `original_${originalName}`;
    const finalPath = path.join(chunkDir, finalFileName);
    const writeStream = fs.createWriteStream(finalPath);
    for (let i = 0; i < totalChunks; i++) {
      const chunk = fs.readFileSync(path.join(chunkDir, `chunk_${i}`));
      writeStream.write(chunk);
    }
    writeStream.end();

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    const chunkFiles = await fs.promises.readdir(chunkDir);
    for (const file of chunkFiles) {
      if (file.startsWith('chunk_')) {
        await fs.promises.unlink(path.join(chunkDir, file));
      }
    }

    await this.redis.set(`upload:${fileId}`, JSON.stringify({ status: UPLOAD_STATUS.PROCESSING, url: null }));
    await this.queue.add('compress', {
      fileId,
      inputPath: finalPath,
      outputName: `${fileId}_compressed.mp4`,
      originalName,
      body: body,
      userId,
    });
  }

  async updateStatus(fileId: string, url: string) {
    await this.redis.set(`upload:${fileId}`, JSON.stringify({ status: UPLOAD_STATUS.DONE, url }));
  }

  async getUploadStatus(fileId: string) {
    const result = await this.redis.get(`upload:${fileId}`);
    return result ? JSON.parse(result) : null;
  }
}
