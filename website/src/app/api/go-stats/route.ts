export const dynamic = "force-dynamic";

// GitHub traffic API — requires a token with `repo` or `public_repo` read access.
// Set GITHUB_TOKEN in your environment (Vercel env vars, .env.local, etc.)
// Returns unique clones for the last 14 days as a proxy for Go module installs.
// Note: there is no official Go module download counter — proxy.golang.org does
// not expose counts, and pkg.go.dev only shows an unquantified "Used by" count.

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return Response.json({ clones: null, error: "GITHUB_TOKEN not set" });
  }

  try {
    const res = await fetch(
      "https://api.github.com/repos/AgentBudget/agentbudget/traffic/clones",
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "agentbudget-website/1.0",
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      return Response.json({ clones: null, error: `GitHub API ${res.status}` });
    }

    const data = await res.json();
    // `uniques` = unique cloners, `count` = total clone events (including repeats)
    const uniques: number = typeof data?.uniques === "number" ? data.uniques : 0;
    const count: number = typeof data?.count === "number" ? data.count : 0;
    return Response.json({ clones: count, unique_cloners: uniques });
  } catch {
    return Response.json({ clones: null });
  }
}
