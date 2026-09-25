// =============================================================================
// Modelo do e-mail da simulacao (Fase 4).
//
// O e-mail e uma recriacao de uma comunicacao NOSSA (aviso do Portal de Suporte
// interno) — nao um clone de servico de terceiro. Ele carrega, por destinatario:
//   - o LINK de clique  -> /c/<token>          (registra "clicou" e leva a landing)
//   - o PIXEL de abertura -> /api/abrir?t=<token> (registra "abriu")
//
// Nao ha nada de credencial aqui. O token e o unico dado que identifica a pessoa.
// =============================================================================

export interface DadosEmail {
  nome: string | null;
  linkClique: string;
  pixelUrl: string;
}

const COR_FUNDO = "#EEEAE3";
const COR_CARD = "#FFFFFF";
const COR_TEXTO = "#1A1A1A";
const COR_SUAVE = "#6B6B6B";
const COR_PRETO = "#111111";
const COR_BORDA = "#E2DED7";

export function montarEmailHtml({ nome, linkClique, pixelUrl }: DadosEmail): string {
  const saudacao = nome ? `Olá, ${escapar(nome)}` : "Olá";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:${COR_FUNDO};font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COR_FUNDO};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${COR_CARD};border:1px solid ${COR_BORDA};border-radius:16px;overflow:hidden;">
        <tr><td style="padding:32px 36px 8px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:700;color:${COR_TEXTO};line-height:1;">EON</div>
          <div style="font-size:14px;color:${COR_SUAVE};margin-top:6px;">Portal de Suporte</div>
        </td></tr>
        <tr><td style="padding:16px 36px 0;">
          <p style="font-size:15px;color:${COR_TEXTO};line-height:1.6;margin:0 0 12px;">${saudacao},</p>
          <p style="font-size:15px;color:${COR_TEXTO};line-height:1.6;margin:0 0 12px;">
            Há uma pendência registrada em seu nome no Portal de Suporte de TI que
            precisa da sua confirmação. Para manter seu acesso ativo, revise os
            dados do chamado o quanto antes.
          </p>
          <p style="font-size:15px;color:${COR_TEXTO};line-height:1.6;margin:0 0 24px;">
            Clique no botão abaixo para acessar o portal e concluir a verificação.
          </p>
        </td></tr>
        <tr><td align="center" style="padding:0 36px 28px;">
          <a href="${linkClique}" style="display:inline-block;background:${COR_PRETO};color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:bold;padding:13px 26px;border-radius:10px;">Acessar o portal</a>
        </td></tr>
        <tr><td style="padding:0 36px 32px;">
          <p style="font-size:12px;color:${COR_SUAVE};line-height:1.5;margin:0;border-top:1px solid ${COR_BORDA};padding-top:16px;">
            Se o botão não funcionar, copie e cole este endereço no navegador:<br>
            <span style="color:${COR_SUAVE};word-break:break-all;">${linkClique}</span>
          </p>
          <p style="font-size:12px;color:${COR_SUAVE};margin:16px 0 0;">© 2026 EON · Tecnologia e Inovação</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
  <!-- Pixel de abertura: registra o evento "abriu" ao carregar a imagem. -->
  <img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;">
</body>
</html>`;
}

export function montarEmailTexto({
  nome,
  linkClique,
}: Pick<DadosEmail, "nome" | "linkClique">): string {
  const saudacao = nome ? `Olá, ${nome}` : "Olá";
  return [
    `${saudacao},`,
    "",
    "Há uma pendência registrada em seu nome no Portal de Suporte de TI que precisa da sua confirmação.",
    "Para manter seu acesso ativo, acesse o portal e conclua a verificação:",
    "",
    linkClique,
    "",
    "© 2026 EON · Tecnologia e Inovação",
  ].join("\n");
}

// Escape minimo para interpolar o nome com seguranca no HTML.
function escapar(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
