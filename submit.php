<?php
// submit.php — relay POST to Google Forms and return JSON result
header('Content-Type: application/json');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Google Forms endpoint (formResponse)
$googleUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScLGGD6vA1gy17t_Nue4vJUkhisJnmRpvfl3JL-vdxjegsjeQ/formResponse';

// Build POST body from incoming POST data
$postFields = http_build_query($_POST);

$ch = curl_init($googleUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
// Set a user-agent
curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT'] ?? 'PHP relay');
// Follow redirects
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
// Timeout
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);

curl_close($ch);

// Google often returns 200 or 302 for successful formResponse submissions. Treat 2xx/3xx as success.
if ($curlErr) {
    http_response_code(502);
    echo json_encode(['success' => false, 'error' => 'cURL error', 'detail' => $curlErr]);
    exit;
}

if ($httpCode >= 200 && $httpCode < 400) {
    echo json_encode(['success' => true, 'httpCode' => $httpCode]);
    exit;
}

// Otherwise return error
http_response_code(502);
echo json_encode(['success' => false, 'httpCode' => $httpCode, 'response' => $response]);

?>