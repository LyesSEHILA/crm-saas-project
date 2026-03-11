import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly brevoApiKey = process.env.BREVO_API_KEY;
  private readonly senderEmail = process.env.BREVO_SENDER_EMAIL || 'contact@solocrm.com';

  async sendWelcomeEmail(contactEmail: string, contactName: string) {
    if (!this.brevoApiKey) {
      this.logger.warn("Clé API Brevo manquante, l'email ne sera pas envoyé.");
      return;
    }

    const payload = {
      sender: { name: "SOLOCRM", email: this.senderEmail },
      to: [{ email: contactEmail, name: contactName }],
      subject: "Bienvenue dans notre réseau ! ✨",
      htmlContent: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 30px; text-align: center;">
            <span style="color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -1px;">SOLO<span style="color: #2563eb;">CRM</span></span>
          </div>
          <div style="padding: 40px; background-color: #ffffff;">
            <h1 style="color: #1e293b; font-size: 22px; font-weight: 800; margin-bottom: 24px;">Ravi de vous rencontrer, ${contactName} !</h1>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Nous sommes ravis de vous compter parmi nos nouveaux contacts. Votre profil a bien été intégré à notre gestionnaire de relations.</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Notre équipe commerciale étudie actuellement votre dossier et reviendra vers vous très prochainement pour discuter de vos besoins.</p>
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f1f5f9;">
              <p style="color: #1e293b; font-size: 14px; font-weight: 700; margin: 0;">L'équipe Commerciale</p>
              <p style="color: #64748b; font-size: 14px; margin: 0;">SOLOCRM - Votre partenaire croissance</p>
            </div>
          </div>
        </div>
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

  async sendLeadConvertedEmail(contactEmail: string, contactName: string, leadTitle: string) {
    if (!this.brevoApiKey) return;

    const payload = {
      sender: { name: "SOLOCRM", email: this.senderEmail },
      to: [{ email: contactEmail, name: contactName }],
      subject: `🚀 Nouveau projet validé : ${leadTitle}`,
      htmlContent: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 30px; text-align: center;">
            <span style="color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -1px;">SOLO<span style="color: #2563eb;">CRM</span></span>
          </div>
          <div style="padding: 40px; background-color: #ffffff;">
            <h1 style="color: #2563eb; font-size: 24px; font-weight: 800; margin-bottom: 24px;">Félicitations ${contactName} !</h1>
            <p style="color: #1e293b; font-size: 16px; font-weight: 600;">Votre projet "<strong>${leadTitle}</strong>" a été validé avec succès.</p>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">C'est une excellente nouvelle. Voici ce qu'il se passe maintenant de notre côté :</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <ul style="color: #475569; font-size: 14px; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;"><b>Facturation :</b> Votre facture a été générée automatiquement.</li>
                <li style="margin-bottom: 8px;"><b>Coordination :</b> Une tâche de suivi a été assignée à notre équipe technique.</li>
                <li><b>Lancement :</b> Nous reprenons contact avec vous d'ici 48h.</li>
              </ul>
            </div>

            <p style="color: #475569; font-size: 15px; line-height: 1.6;">Merci de votre confiance.</p>
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f1f5f9;">
              <p style="color: #1e293b; font-size: 14px; font-weight: 700; margin: 0;">L'équipe Commerciale</p>
              <p style="color: #64748b; font-size: 14px; margin: 0;">SOLOCRM - Propulsé par vos succès</p>
            </div>
          </div>
        </div>
      `
    };

    try {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.brevoApiKey
        },
        body: JSON.stringify(payload)
      });
      this.logger.log(`Email de conversion envoyé à ${contactEmail}`);
    } catch (error) {
      this.logger.error(`Échec de l'envoi de l'email de conversion`, error);
    }
  }

  // --- NOUVELLE MÉTHODE : Envoi d'email personnalisé depuis le Frontend ---
  async sendCustomEmail(to: string, subject: string, htmlContent: string) {
    if (!this.brevoApiKey) {
      this.logger.error("Tentative d'envoi d'email annulée : Clé API Brevo manquante.");
      throw new InternalServerErrorException("Clé API Brevo manquante");
    }

    const payload = {
      sender: { name: "SOLOCRM", email: this.senderEmail },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent,
    };

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.brevoApiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error(`Erreur Brevo lors de l'envoi d'un email personnalisé : ${JSON.stringify(errorData)}`);
        throw new Error("Échec de l'envoi via Brevo");
      }

      this.logger.log(`Email personnalisé envoyé avec succès à ${to}`);
      return { success: true, message: 'Email envoyé avec succès' };
    } catch (error) {
      this.logger.error(`Échec de l'envoi de l'email personnalisé à ${to}`, error);
      throw new InternalServerErrorException("Erreur lors de l'envoi de l'email");
    }
  }

  // --- NOUVELLE MÉTHODE : Email de création de compte Utilisateur ---
  async sendAccountCreationEmail(userEmail: string, firstName: string) {
    if (!this.brevoApiKey) {
      this.logger.warn("Clé API Brevo manquante, l'email de confirmation ne sera pas envoyé.");
      return;
    }

    const payload = {
      sender: { name: "L'équipe SoloCRM", email: this.senderEmail },
      to: [{ email: userEmail, name: firstName }],
      subject: "Bienvenue sur SoloCRM ! 🎉",
      htmlContent: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <div style="background-color: #0f172a; padding: 40px 20px; text-align: center;">
            <span style="color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: -1px;">SOLO<span style="color: #3b82f6;">CRM</span></span>
            <p style="color: #94a3b8; font-size: 16px; margin-top: 10px;">Votre nouvelle arme de vente secrète.</p>
          </div>

          <div style="padding: 40px; background-color: #ffffff;">
            <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 20px;">Bonjour ${firstName},</h1>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Félicitations, votre compte SoloCRM vient d'être créé avec succès ! Nous sommes ravis de vous compter parmi nos utilisateurs.
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Vous avez désormais accès à tous les outils pour centraliser vos contacts, suivre vos pipelines et automatiser votre facturation. Prêt à faire décoller votre chiffre d'affaires ?
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://crm-saas-project.vercel.app/dashboard" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Accéder à mon Dashboard</a>
            </div>

            <p style="color: #475569; font-size: 15px; line-height: 1.6;">Si vous avez la moindre question, n'hésitez pas à répondre directement à cet e-mail. Nous sommes là pour vous aider.</p>
            
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9;">
              <p style="color: #0f172a; font-size: 14px; font-weight: 700; margin: 0;">L'équipe Fondatrice</p>
              <p style="color: #64748b; font-size: 14px; margin: 0;">SOLOCRM - Propulsé par vos succès</p>
            </div>
          </div>
        </div>
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

      if (!response.ok) throw new Error(`Erreur Brevo: ${response.statusText}`);
      this.logger.log(`Email de création de compte envoyé avec succès à ${userEmail}`);
    } catch (error) {
      this.logger.error(`Échec de l'envoi de l'email de bienvenue à ${userEmail}`, error);
    }
  }

}