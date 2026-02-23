import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly brevoApiKey = process.env.BREVO_API_KEY;
  private readonly senderEmail = process.env.BREVO_SENDER_EMAIL;

  async sendWelcomeEmail(contactEmail: string, contactName: string) {
    if (!this.brevoApiKey) {
      this.logger.warn("Clé API Brevo manquante, l'email ne sera pas envoyé.");
      return;
    }

    const payload = {
      sender: { name: "Mon Super CRM", email: this.senderEmail },
      to: [{ email: contactEmail, name: contactName }],
      subject: "Bienvenue dans notre réseau !",
      htmlContent: `
        <html>
          <body>
            <h1>Bonjour ${contactName},</h1>
            <p>Nous sommes ravis de vous compter parmi nos nouveaux contacts.</p>
            <p>Notre équipe reviendra vers vous très prochainement.</p>
            <br>
            <p>Cordialement,<br>L'équipe Commerciale</p>
          </body>
        </html>
      `
    };

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.brevoApiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erreur Brevo: ${response.statusText}`);
      }
      
      this.logger.log(`Email de bienvenue envoyé avec succès à ${contactEmail}`);
    } catch (error) {
      this.logger.error(`Échec de l'envoi de l'email à ${contactEmail}`, error);
    }
  }
}