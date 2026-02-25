import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { MailModule } from '../mail/mail.module'; // Importe le module que nous venons de créer

@Module({
  imports: [MailModule], // <--- On ajoute MailModule ici
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}