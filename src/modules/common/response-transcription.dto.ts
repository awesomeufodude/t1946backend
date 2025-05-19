export class ResponseTranscriptionDto {
  text: string;

  constructor(transcription: any) {
    this.text = transcription.text;
  }
}
