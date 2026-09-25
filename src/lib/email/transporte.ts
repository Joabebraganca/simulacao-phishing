import "server-only";
import nodemailer from "nodemailer";

// =============================================================================
// Transporte de e-mail — SOMENTE no servidor.
//
// Dois modos, escolhidos por EMAIL_TRANSPORTE:
//   - "smtp" (padrao): envio direto por SMTP proprio (nodemailer).
//   - "n8n"          : POST num webhook do n8n, que cuida do disparo.
//
// Nao ha credencial de colaborador em lugar nenhum aqui — apenas as credenciais
// de INFRA de envio (do SMTP/n8n), que vivem em variaveis de ambiente.
// =============================================================================

export interface MensagemEmail {
  de: string;
  para: string;
  assunto: string;
  html: string;
  texto: string;
}

export interface Transporte {
  enviar(msg: MensagemEmail): Promise<void>;
}

function transporteSmtp(): Transporte {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  // secure=true para porta 465 (TLS direto); false para 587 (STARTTLS).
  const secure = (process.env.SMTP_SECURE ?? "false").toLowerCase() === "true";

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP não configurado: defina SMTP_HOST, SMTP_USER e SMTP_PASS.",
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return {
    async enviar(msg) {
      await transporter.sendMail({
        from: msg.de,
        to: msg.para,
        subject: msg.assunto,
        html: msg.html,
        text: msg.texto,
      });
    },
  };
}

function transporteN8n(): Transporte {
  const url = process.env.N8N_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;

  if (!url) {
    throw new Error("n8n não configurado: defina N8N_WEBHOOK_URL.");
  }

  return {
    async enviar(msg) {
      const resposta = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(secret ? { "x-webhook-secret": secret } : {}),
        },
        body: JSON.stringify(msg),
      });
      if (!resposta.ok) {
        throw new Error(`n8n respondeu com status ${resposta.status}.`);
      }
    },
  };
}

// Escolhe o transporte conforme o ambiente. Instancie UMA vez por disparo e
// reutilize para todos os destinatarios da campanha.
export function obterTransporte(): Transporte {
  const tipo = (process.env.EMAIL_TRANSPORTE ?? "smtp").toLowerCase();
  return tipo === "n8n" ? transporteN8n() : transporteSmtp();
}

// Rotulo amigavel para exibir no painel qual transporte esta ativo.
export function nomeTransporte(): string {
  return (process.env.EMAIL_TRANSPORTE ?? "smtp").toLowerCase() === "n8n"
    ? "n8n"
    : "SMTP";
}
