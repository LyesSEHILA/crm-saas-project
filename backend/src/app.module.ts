import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactsModule } from './contacts/contacts.module';
import { LeadsModule } from './leads/leads.module';
import { MailService } from './mail/mail.service';
import { StatsModule } from './stats/stats.module';
import { CompaniesModule } from './companies/companies.module';
import { TasksModule } from './tasks/tasks.module';
import { LeadNotesModule } from './lead-notes/lead-notes.module';
import { SearchModule } from './search/search.module';
import { ActivitiesModule } from './activities/activities.module';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    ContactsModule, LeadsModule, StatsModule, CompaniesModule, TasksModule, LeadNotesModule, SearchModule, ActivitiesModule
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}