export default {
  async fetch() {

    try {

      const home = await fetch(
        "https://www.futebolnatv.com.br/"
      ).then(r => r.text())

      const links = [
        ...new Set(
          [...home.matchAll(/\/aovivo\/[a-z0-9\-]+\.html/gi)]
            .map(x => x[0])
        )
      ]

      const resultado = []

      for (const link of links) {

        const url =
          "https://www.futebolnatv.com.br" + link

        const html =
          await fetch(url).then(r => r.text())

        const times =
          [...html.matchAll(/alt="([^"]+)" width="72" height="72"/g)]

        const casa = times[0]?.[1] || ""
        const fora = times[1]?.[1] || ""

        const p1 =
          html.match(/id="placar-time1"[^>]*>\s*([0-9]+)\s*</)

        const p2 =
          html.match(/id="placar-time2"[^>]*>\s*([0-9]+)\s*</)

        const minuto =
          html.match(
            /text-xl font-semibold tabular-nums text-white[^>]*>\s*([0-9]+)'/
          )

        if (minuto) {

          resultado.push({
            home_team: casa,
            away_team: fora,
            home_score: p1?.[1] || "0",
            away_score: p2?.[1] || "0",
            minute: minuto[1],
            url
          })

        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          total: resultado.length,
          games: resultado
        }, null, 2),
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*"
          }
        }
      )

    } catch (e) {

      return new Response(
        JSON.stringify({
          success: false,
          error: e.toString()
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )

    }

  }
}