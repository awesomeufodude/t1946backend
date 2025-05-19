import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import fs from 'fs';
import tmp from 'tmp';
import { ResponseTranscriptionDto } from './response-transcription.dto';

const MODEL_OPEN_AI = 'whisper-1';
const FORMAT = '.mp4';
@Injectable()
export class CommonService {
  async createTranscription(file: any): Promise<ResponseTranscriptionDto> {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const tempFile = tmp.fileSync({ postfix: FORMAT });
    fs.writeFileSync(tempFile.name, file.buffer);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFile.name),
      model: MODEL_OPEN_AI,
    });

    return new ResponseTranscriptionDto(transcription);
  }
}
