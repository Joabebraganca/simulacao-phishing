import { NextRequest } from "next/server";
import { registrarEvento } from "@/lib/tracking";

// Rota do pixel de abertura: GET /api/abrir?t=TOKEN
// Sempre servida no ato — nunca em cache/estatica.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GIF transparente 1x1 (o menor "pixel espiao" possivel).
const PIXEL_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

// Devolve sempre o mesmo pixel, com headers de imagem e sem cache.
function responderPixel(): Response {
  return new Response(PIXEL_GIF, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(PIXEL_GIF.length),
      // Sem cache: cada abertura precisa bater no servidor para virar evento.
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function GET(req: NextRequest): Promise<Response> {
  const token = req.nextUrl.searchParams.get("t");

  // Registra o "abriu" (silencioso — token invalido nao impede o pixel).
  await registrarEvento(token, "abriu", req.headers.get("user-agent"));

  // NUNCA falha visivel: com ou sem token valido, o pixel sempre carrega.
  return responderPixel();
}
