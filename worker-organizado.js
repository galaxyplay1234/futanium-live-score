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


      // =====================================================
      // MAPEAMENTO DE NOMES
      // =====================================================

      const TEAM_MAP = {

        "RDC": "RD Congo",
        "America MG": "América MG",
        "Borussia Mönchengladbach": "Monchengladbach",
        "Atlético Madrid": "Atlético de Madrid",
        "Bayern München": "Bayern de Munique",
        "Criciuma": "Criciúma",
        "Gremio": "Grêmio",
        "LA Galaxy": "Los Angeles Galaxy",
        "Los Angeles FC": "Los Angeles",
        "Chivas": "Guadalajara",
        "Queretaro FC": "Querétaro",
        "CF America": "Club America",
        "Países Baixos": "Holanda",
        "Lanus": "Lanús",
        "Sao Paulo": "São Paulo",
        "Athletico Paranaense": "Athletico PR",
        "Vitoria": "Vitória",
        "Sarmiento": "Sarmiento Junin",
        "Velez Sarsfield": "Vélez Sarsfield",
        "Famalicao": "Famalicão",
        "Central Cordoba de Santiago": "Central Córdoba",
        "Operario": "Operário",
        "Sao Bernardo": "São Bernardo",
        "Ceara": "Ceará",
        "Estrela da Amadora": "Estrela Amadora",
        "Sporting CP": "Sporting",
        "Maritimo": "Marítimo",
        "Vitoria de Guimaraes": "Vitória de Guimarães",
        "Huracan": "Huracán",
        "Universidad Catolica": "Universidad Católica",
        "Paris Saint-Germain": "PSG",
        "Deportivo A Coruña": "A Coruna",
        "Atletico Madrid": "Atlético de Madrid",
        "Malaga": "Málaga",
        "Deportivo Alaves": "Alavés",
        "Athletic Club": "Athletic Bilbao",
        "Celta Vigo": "Celta de Vigo",
        "Al Hilal": "Al-Hilal",
        "Al Ahli": "Al-Ahli",
        "Bodø/Glimt": "Bodo Glimt",
        "Slavia Prague": "Slavia Praga",
        "Atlético Tucumán": "Atletico Tucuman",
        "Sabah FK": "Sabah Baku",
        "Estudiantes de Río Cuarto": "Estudiantes de Rio Cuarto",
        "1. FC Köln": "Koln",
        "Estónia": "Estônia",
        "Macedónia do Norte": Macedônia do Norte",
        "Eslovénia": "Eslovênia",
        "Atlético-MG": "Atlético MG"

      };


      function normalizeTeam(name) {

        return TEAM_MAP[name] || name;

      }


      const games = [];


      // =====================================================
// 🔥 PROCESSA AS LIGAS
// =====================================================

function normalizeLeagueName(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

for (const league of (matchesData.leagues || [])) {

  // 🚫 IGNORA TODAS AS COMPETIÇÕES DA UEFA YOUTH LEAGUE
  if (
    normalizeLeagueName(league.name).includes("uefa youth league")
  ) {
    continue;
  }


        for (const match of (league.matches || [])) {

          const status = match.status || {};


          // Apenas jogos iniciados

          if (!status.started) continue;


          const homeId =
            String(match.home?.id || "");


          const awayId =
            String(match.away?.id || "");


          const homeName =
            normalizeTeam(

              participants[homeId] ||

              match.home?.longName ||

              match.home?.name ||

              ""

            );


          const awayName =
            normalizeTeam(

              participants[awayId] ||

              match.away?.longName ||

              match.away?.name ||

              ""

            );


          let minute = "";


          // =====================================================
          // ⏹️ ENCERRADO
          // =====================================================

          if (status.finished === true) {

            minute = "encerrado";

          }


          // =====================================================
          // ⏸️ INTERVALO
          // =====================================================

          else if (

            status.liveTime?.short === "HT" ||

            status.liveTime?.long === "Half-Time" ||

            match.statusId === 10

          ) {

            minute = "intervalo";

          }


          // =====================================================
          // 🔴 OUTROS STATUS
          // =====================================================

          else if (status.liveTime?.short) {

            const raw =
              status.liveTime.short

                .replace(/‎/g, "")

                .replace(/'/g, "")

                .replace(/’/g, "")

                .trim();


            if (/^\d+(\+\d+)?$/.test(raw)) {

              minute = raw;

            }

            else if (raw === "Pen") {

              minute = "pênaltis";

            }

            else if (raw === "ET") {

              minute = "prorrogação";

            }

            else if (raw === "AET") {

              minute = "prorrogação encerrada";

            }

            else if (raw === "IR") {

              minute = "interrompido";

            }

            else {

              minute = raw;

            }

          }


          // =====================================================
          // 🔥 ADICIONA JOGO
          // =====================================================

          games.push({

            league:
              league.name || "",

            home_team:
              homeName,

            away_team:
              awayName,

            home_score:
              String(match.home?.score ?? 0),

            away_score:
              String(match.away?.score ?? 0),

            minute,

            match_id:
              match.id

          });

        }

      }


      // =====================================================
      // 🔥 RESPOSTA
      // =====================================================

      return new Response(

        JSON.stringify(

          {

            success: true,

            total:
              games.length,

            games

          },

          null,

          2

        ),

        {

          headers: {

            "Content-Type":
              "application/json; charset=utf-8"

          }

        }

      );


    } catch (e) {

      // =====================================================
      // ❌ ERRO
      // =====================================================

      return new Response(

        JSON.stringify(

          {

            success: false,

            error:
              e.message

          },

          null,

          2

        ),

        {

          headers: {

            "Content-Type":
              "application/json; charset=utf-8"

          }

        }

      );

    }

  }

};