import Link from "next/link";
import { cores, rotulo, campo, botao, botaoSecundario, cartao } from "@/lib/ui";
import { criarCampanha } from "@/app/painel/actions";

export const metadata = { title: "Nova campanha — Painel" };

export default async function NovaCampanhaPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/painel"
          style={{ fontSize: 13, color: cores.suave, textDecoration: "none" }}
        >
          ← Campanhas
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: cores.texto, margin: "8px 0 0" }}>
          Nova campanha
        </h1>
      </div>

      {erro ? (
        <div
          style={{
            background: "#FBEBEB",
            border: `1px solid #E9C9C9`,
            color: cores.vermelho,
            fontSize: 13,
            padding: "10px 12px",
            borderRadius: 10,
            marginBottom: 16,
          }}
        >
          {erro}
        </div>
      ) : null}

      <form action={criarCampanha} style={{ ...cartao, display: "grid", gap: 18 }}>
        <div>
          <label style={rotulo} htmlFor="nome">
            Nome da campanha
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            required
            style={campo}
            placeholder="Ex.: Piloto — Financeiro Q4"
          />
        </div>

        <div>
          <label style={rotulo} htmlFor="setor_alvo">
            Setor-alvo
          </label>
          <input
            id="setor_alvo"
            name="setor_alvo"
            type="text"
            required
            style={campo}
            placeholder="Ex.: Financeiro"
          />
        </div>

        <div>
          <label style={rotulo} htmlFor="landing_slug">
            Landing (página nossa recriada)
          </label>
          <select id="landing_slug" name="landing_slug" style={campo} defaultValue="suporte">
            <option value="suporte">Suporte / Chamado de TI (/suporte)</option>
          </select>
          <p style={{ fontSize: 12, color: cores.suave, margin: "6px 0 0" }}>
            Sempre uma página de propriedade nossa. Novas landings entram aqui
            conforme forem criadas.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={rotulo} htmlFor="remetente">
              Remetente (De:)
            </label>
            <input
              id="remetente"
              name="remetente"
              type="text"
              required
              style={campo}
              placeholder="suporte@eonbr.com"
            />
          </div>
          <div>
            <label style={rotulo} htmlFor="assunto">
              Assunto do e-mail
            </label>
            <input
              id="assunto"
              name="assunto"
              type="text"
              required
              style={campo}
              placeholder="Ação necessária: seu chamado"
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
          <button type="submit" style={botao}>
            Criar campanha
          </button>
          <Link href="/painel" style={botaoSecundario}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
