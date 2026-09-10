import type { CSSProperties } from "react";

// Pagina de conscientizacao pos-clique (Fase 3, ja acessivel pela Fase 2).
// Tom acolhedor: explica que foi uma simulacao interna autorizada, aponta os
// sinais do golpe e orienta o proximo passo. Sem culpabilizar ninguem.

export const metadata = {
  title: "Simulação de conscientização — EON",
};

const cor = {
  fundo: "#EEEAE3",
  card: "#FFFFFF",
  texto: "#1A1A1A",
  suave: "#5B5B5B",
  borda: "#E2DED7",
  destaque: "#F4F1EB",
};

const bloco: CSSProperties = {
  background: "#FFFFFF",
  border: `1px solid #E2DED7`,
  borderRadius: 12,
  padding: "16px 18px",
};

function Sinal({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <li style={{ marginBottom: 14, lineHeight: 1.55, color: cor.texto }}>
      <strong>{titulo}</strong>
      <div style={{ color: cor.suave, fontSize: 14, marginTop: 2 }}>{texto}</div>
    </li>
  );
}

export default function TreinamentoPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: cor.fundo,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "48px 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          background: cor.card,
          borderRadius: 16,
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
          padding: "40px 40px 36px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 34,
            fontWeight: 700,
            color: cor.texto,
            lineHeight: 1,
          }}
        >
          EON
        </div>

        <span
          style={{
            display: "inline-block",
            marginTop: 18,
            padding: "5px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "#7A5B00",
            background: "#FBF2D9",
            borderRadius: 999,
          }}
        >
          Simulação interna de phishing
        </span>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: cor.texto,
            margin: "16px 0 10px",
            lineHeight: 1.3,
          }}
        >
          Calma — isto foi um treinamento, e está tudo bem.
        </h1>

        <p style={{ fontSize: 15, color: cor.suave, lineHeight: 1.6, margin: 0 }}>
          A página que você acabou de acessar fazia parte de uma{" "}
          <strong>simulação de phishing autorizada</strong> pela diretoria, conduzida
          pelo próprio time de TI. <strong>Nenhuma senha, login ou dado que você
          tenha digitado foi lido, gravado ou enviado</strong> — o formulário foi
          descartado na hora. Registramos apenas que o link foi aberto, para
          entender como a empresa pode se proteger melhor. Ninguém está sendo
          avaliado ou exposto individualmente.
        </p>

        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: cor.texto,
            margin: "28px 0 12px",
          }}
        >
          Os sinais que denunciavam o golpe
        </h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <Sinal
            titulo="Endereço (URL) fora do domínio oficial"
            texto="A página não estava no endereço interno de sempre. Antes de digitar qualquer coisa, confira na barra do navegador se o domínio é realmente o oficial da EON."
          />
          <Sinal
            titulo="Pretexto de urgência"
            texto="Mensagens que pressionam para você agir 'agora', 'imediatamente' ou sob ameaça de bloqueio existem para te fazer pular a etapa de desconfiar. Urgência é um sinal de alerta."
          />
          <Sinal
            titulo="Pedido de dados por um caminho inesperado"
            texto="Formulários que pedem login/senha chegando por e-mail ou link avulso merecem atenção redobrada — mesmo quando a aparência imita uma página conhecida."
          />
        </ul>

        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: cor.texto,
            margin: "28px 0 12px",
          }}
        >
          O que fazer da próxima vez
        </h2>
        <div style={{ ...bloco, background: cor.destaque }}>
          <ul style={{ margin: 0, paddingLeft: 18, color: cor.texto, lineHeight: 1.6, fontSize: 14 }}>
            <li>Pare antes de clicar e confira o endereço do link.</li>
            <li>Desconfie de urgência e de pedidos de senha por e-mail.</li>
            <li>Na dúvida, não digite nada — acesse os sistemas pelos atalhos oficiais de sempre.</li>
            <li>
              Suspeitou de algo? Encaminhe para o time de TI. Relatar é sempre a
              atitude certa, nunca um problema.
            </li>
          </ul>
        </div>

        <p
          style={{
            fontSize: 14,
            color: cor.suave,
            lineHeight: 1.6,
            marginTop: 24,
          }}
        >
          Obrigado por dedicar um minuto a isto. Cada pessoa atenta deixa a EON
          inteira mais segura. 💚
        </p>

        <footer
          style={{
            textAlign: "center",
            fontSize: 12,
            color: cor.suave,
            marginTop: 28,
            borderTop: `1px solid ${cor.borda}`,
            paddingTop: 18,
          }}
        >
          © 2026 EON · Tecnologia e Inovação
        </footer>
      </div>
    </main>
  );
}
