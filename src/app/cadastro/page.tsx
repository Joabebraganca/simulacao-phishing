import type { CSSProperties } from "react";
import { rotulo, campo, botao, botaoSecundario, cores } from "@/lib/ui";
import { MolduraAuth, LinkAuth } from "@/components/moldura-auth";
import { cadastrar, verificarCadastro, reenviarCadastro } from "@/app/login/actions";

export const metadata = { title: "Criar conta — Painel de Conscientização" };

// Campo do codigo de 6 digitos: centralizado e espacado.
const campoCodigo: CSSProperties = {
  ...campo,
  textAlign: "center",
  fontSize: 22,
  letterSpacing: 8,
  fontWeight: 700,
};

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; sucesso?: string; email?: string; etapa?: string }>;
}) {
  const { erro, sucesso, email, etapa } = await searchParams;

  // -------------------------------------------------------------------------
  // Etapa 2: confirmar o codigo enviado por e-mail
  // -------------------------------------------------------------------------
  if (etapa === "verificar") {
    return (
      <MolduraAuth
        subtitulo="Confirme seu e-mail"
        erro={erro}
        sucesso={sucesso}
        rodape={<LinkAuth href="/login">Voltar para o login</LinkAuth>}
      >
        <p style={{ fontSize: 14, color: cores.suave, lineHeight: 1.5, margin: "0 0 18px" }}>
          Enviamos um código de 6 dígitos para{" "}
          <strong style={{ color: cores.texto }}>{email || "seu e-mail"}</strong>. Informe-o
          abaixo para ativar sua conta.
        </p>

        <form action={verificarCadastro} style={{ display: "grid", gap: 16 }}>
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
          <button type="submit" style={{ ...botao, width: "100%" }}>
            Confirmar e entrar
          </button>
        </form>

        <form action={reenviarCadastro} style={{ marginTop: 10 }}>
          <input type="hidden" name="email" value={email ?? ""} />
          <button type="submit" style={{ ...botaoSecundario, width: "100%" }}>
            Reenviar código
          </button>
        </form>
      </MolduraAuth>
    );
  }

  // -------------------------------------------------------------------------
  // Etapa 1: dados do cadastro
  // -------------------------------------------------------------------------
  return (
    <MolduraAuth
      subtitulo="Criar conta"
      erro={erro}
      rodape={
        <>
          Já tem conta? <LinkAuth href="/login">Entrar</LinkAuth>
        </>
      }
    >
      <form action={cadastrar} style={{ display: "grid", gap: 16 }}>
        <div>
          <label style={rotulo} htmlFor="nome">
            Nome
          </label>
          <input id="nome" name="nome" type="text" autoComplete="name" style={campo} placeholder="Seu nome" />
        </div>
        <div>
          <label style={rotulo} htmlFor="email">
            E-mail corporativo
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={rotulo} htmlFor="senha">
              Senha
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
              Repetir senha
            </label>
            <input
              id="senha2"
              name="senha2"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              style={campo}
              placeholder="Repita a senha"
            />
          </div>
        </div>
        <button type="submit" style={{ ...botao, width: "100%", marginTop: 4 }}>
          Criar conta
        </button>
      </form>

      <p style={{ fontSize: 12, color: cores.suave, textAlign: "center", lineHeight: 1.5, marginTop: 18 }}>
        Acesso restrito à equipe de TI. Use seu e-mail corporativo.
      </p>
    </MolduraAuth>
  );
}
