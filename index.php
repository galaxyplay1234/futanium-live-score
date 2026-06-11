<?php

header('Content-Type: application/json; charset=utf-8');

function getHtml($url)
{
    $ch = curl_init();

    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_USERAGENT => 'Mozilla/5.0'
    ]);

    $html = curl_exec($ch);
    curl_close($ch);

    return $html;
}

$home = getHtml("https://www.futebolnatv.com.br/");

preg_match_all(
    '#/aovivo/[a-z0-9\-]+\.html#i',
    $home,
    $matches
);

$links = array_unique($matches[0]);

$resultado = [];

foreach ($links as $link)
{
    $url = "https://www.futebolnatv.com.br" . $link;

    $html = getHtml($url);

    // Times
    preg_match_all(
        '/alt="([^"]+)" width="72" height="72"/',
        $html,
        $times
    );

    $casa = $times[1][0] ?? '';
    $fora = $times[1][1] ?? '';

    // Placar
    preg_match(
        '/id="placar-time1"[^>]*>\s*([0-9]+)\s*</',
        $html,
        $p1
    );

    preg_match(
        '/id="placar-time2"[^>]*>\s*([0-9]+)\s*</',
        $html,
        $p2
    );

    $placarCasa = $p1[1] ?? '0';
    $placarFora = $p2[1] ?? '0';

    // Minuto
    preg_match(
        '/text-xl font-semibold tabular-nums text-white[^>]*>\s*([0-9]+)\'/s',
        $html,
        $min
    );

    $minuto = $min[1] ?? '';

    // Somente jogos ao vivo
    if ($minuto != '')
    {
        $resultado[] = [
            "home_team"  => $casa,
            "away_team"  => $fora,
            "home_score" => $placarCasa,
            "away_score" => $placarFora,
            "minute"     => $minuto,
            "url"        => $url
        ];
    }
}

echo json_encode([
    "success" => true,
    "total" => count($resultado),
    "games" => $resultado
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);