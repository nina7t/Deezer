<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gère les requêtes OPTIONS (preflight)

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Accepte soit le paramètre 'url' classique, soit 'data' en base64
$url = '';

// Tentative avec base64 d'abord (plus robuste)
if (!empty($_GET['data'])) {
    $decoded = base64_decode($_GET['data'], true);
    if ($decoded !== false) {
        $url = $decoded;
    }
}

// Sinon tente avec le paramètre url classique
if (empty($url) && !empty($_GET['url'])) {
    $url = $_GET['url'];
}

if (empty($url)) {
    http_response_code(400);
    echo json_encode(['error' => 'URL manquante']);
    exit;
}

// Vérifie que l'URL est bien de l'API Deezer

if (strpos($url, 'api.deezer.com') === false) {
    http_response_code(403);
    echo json_encode(['error' => 'URL non autorisée']);
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur cURL: ' . $error]);
    exit;
}

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(['error' => 'Erreur API Deezer', 'code' => $httpCode]);
    exit;
}

echo $response;
?>