/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Impede o `next dev` de anexar o bloco "nextjs-agent-rules" ao CLAUDE.md
  // (o CLAUDE.md deste projeto e curado a mao, com o principio de privacidade).
  agentRules: false,
};

export default nextConfig;
