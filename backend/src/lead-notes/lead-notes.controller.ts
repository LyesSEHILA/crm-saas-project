import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LeadNotesService } from './lead-notes.service';
import { CreateLeadNoteDto } from './dto/create-lead-note.dto';
import { UpdateLeadNoteDto } from './dto/update-lead-note.dto';

@Controller('lead-notes')
export class LeadNotesController {
  constructor(private readonly leadNotesService: LeadNotesService) {}

  @Post()
  async create(@Body() dto: { lead_id: string, content: string }) {
    return await this.leadNotesService.create(dto);
  }

  @Get('lead/:id')
  async findByLead(@Param('id') leadId: string) {
    return await this.leadNotesService.findByLead(leadId);
  }

  @Delete(':id')
async remove(@Param('id') id: string) {
  return await this.leadNotesService.remove(id);
}

}