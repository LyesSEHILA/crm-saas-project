import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactsModule } from './contacts/contacts.module';
import { LeadsModule } from './leads/leads.module';
import { MailService } from './mail/mail.service';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    ContactsModule, LeadsModule, StatsModule
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}