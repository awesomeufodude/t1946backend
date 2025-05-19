import { Body, Controller, Get, Param, Post, Request, UseInterceptors } from '@nestjs/common';
import { Private } from 'src/shared/decorators/auth.decorators';
import { AppDomain } from 'src/shared/domain/app.domain';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { CreateNoteDto } from './notes.dto';
import { NotesService } from './notes.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('sales/v1/:type/:id/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Private([AppDomain.Permissions.CREATE_NOTE])
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async create(@Request() req, @Param('type') type: string, @Param('id') id: string, @Body() body: CreateNoteDto) {
    const userId = req.user.sub;
    const data = await this.notesService.createNote(type, id, userId, body);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.CREATE_NOTE])
  @Get()
  async getNotes(@Param('type') type: string, @Param('id') id: string) {
    const data = await this.notesService.getNotes(type, id);
    return new SuccessResponseDto(data);
  }
}
