import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from './mail/mail.service'; // <-- 1. Import du MailService

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService // <-- 2. Injection du MailService
  ) {}

  // Route par défaut (GET http://localhost:3000/)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // --- NOUVELLE ROUTE : Envoi de l'email de bienvenue ---
  // (POST http://localhost:3000/auth/welcome)
  @Post('auth/welcome')
  async sendWelcomeUser(@Body() body: { email: string; name: string }) {
    await this.mailService.sendAccountCreationEmail(body.email, body.name);
    return { success: true, message: 'Email de bienvenue envoyé !' };
  }
}