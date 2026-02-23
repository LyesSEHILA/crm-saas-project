import { Module } from '@nestjs/common';
import { LeadNotesService } from './lead-notes.service';
import { LeadNotesController } from './lead-notes.controller';

@Module({
  controllers: [LeadNotesController],
  providers: [LeadNotesService],
})
export class LeadNotesModule {}
