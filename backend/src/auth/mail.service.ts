import {
  Injectable,
  Logger,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly fromAddress: string;

  constructor() {
    const host = process.env.SMTP_HOST?.trim();
    const rawPort = process.env.SMTP_PORT?.trim() || '587';
    const port = Number(rawPort);
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    this.fromAddress = process.env.SMTP_FROM ?? user ?? 'no-reply@barberia.local';

    if (!host || !user || !pass || !Number.isFinite(port)) {
      this.logger.warn(
        `SMTP no configurado. host=${Boolean(host)} user=${Boolean(user)} pass=${Boolean(pass)} portValido=${Number.isFinite(port)} rawPort=${rawPort}`,
      );
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendRegistrationVerification(email: string, verifyUrl: string): Promise<void> {
    const subject = 'Confirma tu cuenta en Barberia';
    const html = [
      '<h2>Confirma tu cuenta</h2>',
      '<p>Recibimos una solicitud de registro. Para activar tu cuenta, confirma tu correo:</p>',
      `<p><a href="${verifyUrl}">Confirmar mi cuenta</a></p>`,
      '<p>Si no fuiste tu, puedes ignorar este mensaje.</p>',
    ].join('');

    const text = [
      'Confirma tu cuenta en Barberia.',
      `Abre este enlace para confirmar tu cuenta: ${verifyUrl}`,
      'Si no fuiste tu, ignora este correo.',
    ].join('\n');

    await this.sendMail(email, subject, html, text);
  }

  async sendLoginAlert(
    email: string,
    details: {
      ip: string;
      userAgent: string;
      logoutEverywhereUrl: string;
    },
  ): Promise<void> {
    const subject = 'Nuevo inicio de sesion detectado';
    const html = [
      '<h2>Detectamos un inicio de sesion</h2>',
      `<p><strong>IP:</strong> ${details.ip}</p>`,
      `<p><strong>Dispositivo:</strong> ${details.userAgent}</p>`,
      '<p>Si fuiste tu, puedes ignorar este correo.</p>',
      `<p>Si no fuiste tu, protege tu cuenta ahora:</p><p><a href="${details.logoutEverywhereUrl}">Cerrar sesion en todos los dispositivos</a></p>`,
    ].join('');

    const text = [
      'Nuevo inicio de sesion detectado.',
      `IP: ${details.ip}`,
      `Dispositivo: ${details.userAgent}`,
      `Si no fuiste tu, cierra sesion en todos los dispositivos: ${details.logoutEverywhereUrl}`,
    ].join('\n');

    await this.sendMail(email, subject, html, text);
  }

  private async sendMail(
    to: string,
    subject: string,
    html: string,
    text: string,
  ): Promise<void> {
    if (!this.transporter) {
      throw new ServiceUnavailableException(
        'El servicio de correo no esta configurado. Define SMTP_HOST, SMTP_PORT, SMTP_USER y SMTP_PASS.',
      );
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        html,
        text,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`No se pudo enviar correo a ${to}: ${message}`);
      throw new InternalServerErrorException(
        'No se pudo enviar el correo de verificacion.',
      );
    }
  }
}
