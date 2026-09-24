import Link from "next/link";
import { cores, botao } from "@/lib/ui";

// Pagina inicial publica. Aponta a equipe de TI para o painel (que exige login).
export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "80px auto", padding: "0 24px" }}>
      <h1 style={{ color: cores.texto }}>Plataforma de Conscientização</h1>
      <p style={{ color: cores.texto, lineHeight: 1.6 }}>
        Ferramenta interna de simulação de phishing (conscientização). Este
        sistema mede <strong>comportamento, não credenciais</strong>.
      </p>
      <p style={{ color: cores.suave }}>
        Acesso restrito à equipe de TI.
      </p>
      <Link href="/painel" style={{ ...botao, marginTop: 8 }}>
        Entrar no painel
      </Link>
    </main>
  );
}
