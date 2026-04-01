export const dynamic = "force-dynamic";

const REPO = "https://github.com/AgentBudget/agentbudget";
const MODULE = "agentbudget.dev/go";

async function increment() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;
  fetch(`${url}/incr/go_installs`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

export async function GET(request: Request) {
  const isGoGet = new URL(request.url).searchParams.get("go-get") === "1";

  increment(); // fire-and-forget — silent if KV not configured

  if (isGoGet) {
    return new Response(
      `<!DOCTYPE html><html><head>
<meta name="go-import" content="${MODULE} git ${REPO}">
<meta name="go-source" content="${MODULE} ${REPO} ${REPO}/tree/main/sdks/go{/dir} ${REPO}/blob/main/sdks/go{/dir}/{file}#L{line}">
</head><body>go get ${MODULE}</body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  return Response.redirect(`https://pkg.go.dev/${MODULE}`, 302);
}
