// Pagina inicial. No piloto, redireciona para o painel (Fase 5).
// Por enquanto, um marcador simples de que a Fundacao (Fase 0) esta de pe.

export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "80px auto", padding: "0 24px" }}>
      <h1>Plataforma de Conscientização</h1>
      <p>
        Ferramenta interna de simulação de phishing (conscientização). Este
        sistema mede <strong>comportamento, não credenciais</strong>.
      </p>
      <p style={{ color: "#666" }}>
        Fase 0 (Fundação) concluída. Painel e campanhas nas próximas fases.
      </p>
    </main>
  );
}
