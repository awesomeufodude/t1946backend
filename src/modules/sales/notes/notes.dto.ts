import { CoreDtos } from 'src/shared/dtos/core.dto';

export class NoteResponseDto {
  id: string;
  content: string;
  budgetId?: string;
  workorderId?: number;
  step: string;
  files?: FilesNoteDto[];
  createdBy: CoreDtos.UserDto;
  createdAt: Date;

  constructor(note: any) {
    this.id = note.id;
    this.content = note.text;
    this.step = note.step;
    this.budgetId = note.budget?.id ?? null;
    this.workorderId = note.workorderId ?? null;
    this.files = note.files?.map((file) => new FilesNoteDto(file)) ?? [];
    this.createdBy = new CoreDtos.UserDto(note.createdBy);
    this.createdAt = note.createdAt;
  }
}

export class CreateNoteDto {
  content: string;
  step: string;
  storeId?: string;
  files?: FilesDto[];
}

export class FilesDto {
  url: string;
  type: 'image' | 'video';
}

export class FilesNoteDto {
  id: string;
  name: string;
  url: string;
  noteId: string;
  type: string;
  createdAt: Date;

  constructor(file: any) {
    const baseUrl = process.env.BASE_URL_STATIC_FILES;
    const staticPath = process.env.STATIC_URL_PATH;
    this.id = file.id;
    this.name = file.name;
    this.url = `${baseUrl}/${staticPath}/${file.url}`;
    this.noteId = file.noteId;
    this.type = file.type;
    this.createdAt = file.createdAt;
  }
}
