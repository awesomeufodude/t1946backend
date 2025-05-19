import { FilesDto } from '../notes.dto';

export class CreateFileToNoteDto {
  noteId: string;
  files: FilesDto[];
}
