import type { CSSProperties } from "react";
import { rotulo, campo, botao, cores } from "@/lib/ui";
import { MolduraAuth, LinkAuth } from "@/components/moldura-auth";
import { solicitarRecuperacao, redefinirSenha } from "@/app/login/actions";

export const metadata = { title: "Recuperar senha — Painel de Conscientização" };

const campoCodigo: CSSProperties = {
  ...campo,
  textAlign: "center",
  fontSize: 22,
  letterSpacing: 8,
  fontWeight: 700,
};

export default async function RecuperarPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; sucesso?: string; email?: string; etapa?: string }>;
}) {
  const { erro, sucesso, email, etapa } = await searchParams;

  // -------------------------------------------------------------------------
  // Etapa 2: redefinir a senha com o codigo recebido
  // -------------------------------------------------------------------------
  if (etapa === "redefinir") {
    return (
      <MolduraAuth
        subtitulo="Redefinir senha"
        erro={erro}
        sucesso={sucesso}
        rodape={<LinkAuth href="/login">Voltar para o login</LinkAuth>}
      >
        <p style={{ fontSize: 14, color: cores.suave, lineHeight: 1.5, margin: "0 0 18px" }}>
          Informe o código de 6 dígitos enviado para{" "}
          <strong style={{ color: cores.texto }}>{email || "seu e-mail"}</strong> e escolha a
          nova senha.
        </p>

        <form action={redefinirSenha} style={{ display: "grid", gap: 16 }}>
          <input type="hidden" name="email" value={email ?? ""} />
          <div>
            <label style={rotulo} htmlFor="codigo">
              Código de verificação
            </label>
            <input
              id="codigo"
              name="codigo"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              required
              style={campoCodigo}
              placeholder="000000"
            />
          </div>
          <div>
            <label style={rotulo} htmlFor="senha">
              Nova senha
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              style={campo}
              placeholder="Mín. 8 caracteres"
            />
          </div>
          <div>
            <label style={rotulo} htmlFor="senha2">
              Repetir nova senha
            </label>
            <input
              id="senha2"
              name="senha2"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              style={campo}
              placeholder="Repita a nova senha"
            />
          </div>
          <button type="submit" style={{ ...botao, width: "100%" }}>
            Redefinir e entrar
          </button>
        </form>
      </MolduraAuth>
    );
  }

  // -------------------------------------------------------------------------
  // Etapa 1: pedir o e-mail
  // -------------------------------------------------------------------------
  return (
    <MolduraAuth
      subtitulo="Recuperar senha"
      erro={erro}
      sucesso={sucesso}
      rodape={<LinkAuth href="/login">Voltar para o login</LinkAuth>}
    >
      <p style={{ fontSize: 14, color: cores.suave, lineHeight: 1.5, margin: "0 0 18px" }}>
        Informe seu e-mail e enviaremos um código de 6 dígitos para você redefinir a senha.
      </p>

      <form action={solicitarRecuperacao} style={{ display: "grid", gap: 16 }}>
        <div>
          <label style={rotulo} htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            defaultValue={email ?? ""}
            style={campo}
            placeholder="voce@eonbr.com"
          />
        </div>
        <button type="submit" style={{ ...botao, width: "100%" }}>
          Enviar código
        </button>
      </form>
    </MolduraAuth>
  );
}
