export default {
  async fetch(request) {
    try {

      const date = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");

      // Jogos
      const matchesResp = await fetch(
        `https://www.fotmob.com/api/data/matches?date=${date}&timezone=America%2FSao_Paulo&includeNextDayLateNight=true`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        }
      );

      const matchesData = await matchesResp.json();

      // Traduções
      const transResp = await fetch(
        "https://www.fotmob.com/_next/data/nVG1njYQRVXsfPs8R6YW_/pt-BR.json?lng=pt-BR",
        {
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        }
      );

      const transData = await transResp.json();

      const participants =
        transData?.pageProps?.fallback?.[
          "/api/translationmapping?locale=pt-BR"
        ]?.Participants || {};

      const games = [];

      for (const league of (matchesData.leagues || [])) {

        for (const match of (league.matches || [])) {

          const status = match.status || {};

          if (!status.ongoing) continue;

          const homeId = String(match.home?.id || "");
          const awayId = String(match.away?.id || "");

          const homeName =
            participants[homeId] ||
            match.home?.name ||
            "";

          const awayName =
            participants[awayId] ||
            match.away?.name ||
            "";

          let minute = "";

          if (status.liveTime?.short) {
            minute = status.liveTime.short.replace(/[^\d]/g, "");
          }

          games.push({
            league: league.name,
            home_team: homeName,
            away_team: awayName,
            home_score: String(match.home?.score ?? 0),
            away_score: String(match.away?.score ?? 0),
            minute,
            match_id: match.id
          });
        }
      }

      return Response.json({
        success: true,
        total: games.length,
        games
      });

    } catch (e) {

      return Response.json({
        success: false,
        error: e.message
      });
    }
  }
};