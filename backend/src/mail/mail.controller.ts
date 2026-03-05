import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @HttpCode(200)
  async sendEmail(@Body() body: { to: string; subject: string; htmlContent: string }) {
    return this.mailService.sendCustomEmail(body.to, body.subject, body.htmlContent);
  }
}