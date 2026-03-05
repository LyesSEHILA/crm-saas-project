import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller'; // <-- Ajout de l'import

@Module({
  controllers: [MailController], // <-- Ajout du contrôleur ici
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}