export default {

  async fetch(request) {

    try {

      const date = new Date()

        .toLocaleDateString("sv-SE", {

          timeZone: "America/Sao_Paulo"

        })

        .replace(/-/g, "");

      // Jogos do FotMob

      const matchesResp = await fetch(

        `https://www.fotmob.com/api/data/matches?date=${date}&timezone=America%2FSao_Paulo&includeNextDayLateNight=true`,

        {

          headers: {

            "User-Agent": "Mozilla/5.0",

            "Accept": "application/json",

            "Referer": "https://www.fotmob.com/",

            "Origin": "https://www.fotmob.com"

          }

        }

      );

      const matchesData = await matchesResp.json();

      // Traduções PT-BR

      const transResp = await fetch(

        "https://www.fotmob.com/api/translationmapping?locale=pt-BR",

        {

          headers: {

            "User-Agent": "Mozilla/5.0",

            "Accept": "application/json",

            "Referer": "https://www.fotmob.com/",

            "Origin": "https://www.fotmob.com"

          }

        }

      );

      const transData = await transResp.json();

      const participants = transData.Participants || {};

      const games = [];

      for (const league of (matchesData.leagues || [])) {

        for (const match of (league.matches || [])) {

          const status = match.status || {};

          // Apenas jogos iniciados

          if (!status.started) continue;

          const homeId = String(match.home?.id || "");

          const awayId = String(match.away?.id || "");

          const homeName =

            participants[homeId] ||

            match.home?.longName ||

            match.home?.name ||

            "";

          const awayName =

            participants[awayId] ||

            match.away?.longName ||

            match.away?.name ||

            "";

          let minute = "";

          // Encerrado

          if (status.finished === true) {

            minute = "encerrado";

          }

          // Intervalo

          else if (

            status.liveTime?.short === "HT" ||

            status.liveTime?.long === "Half-Time" ||

            match.statusId === 10

          ) {

            minute = "intervalo";

          }

          // Outros status

          else if (status.liveTime?.short) {

            const raw = status.liveTime.short

              .replace(/‎/g, "")

              .replace(/'/g, "")

              .replace(/’/g, "")

              .trim();

            if (/^\d+(\+\d+)?$/.test(raw)) {

              minute = raw;

            } else if (raw === "Pen") {

              minute = "pênaltis";

            } else if (raw === "ET") {

              minute = "prorrogação";

            } else if (raw === "AET") {

              minute = "prorrogação encerrada";

            } else {

              minute = raw;

            }

          }

          games.push({

            league: league.name || "",

            home_team: homeName,

            away_team: awayName,

            home_score: String(match.home?.score ?? 0),

            away_score: String(match.away?.score ?? 0),

            minute,

            match_id: match.id

          });

        }

      }

      return new Response(
  JSON.stringify(
    {
      success: true,
      total: games.length,
      games
    },
    null,
    2
  ),
  {
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  }
);

    } catch (e) {

      return new Response(
  JSON.stringify(
    {
      success: false,
      error: e.message
    },
    null,
    2
  ),
  {
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  }
);
    }
  }
};