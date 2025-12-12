<?php

// Your email
$to = "intake@ymg-legal.com";

// Email subject — shows which form submitted
$formName = isset($_POST['formId']) ? $_POST['formId'] : "New Claim Submission";
$subject = "New Form Submission: " . $formName;

// Build HTML table
$table = "
<table border='1' cellpadding='8' cellspacing='0' style='border-collapse: collapse; font-family: Arial;'>
<tr style='background:#f2f2f2; font-weight:bold;'>
    <td>Field</td>
    <td>Value</td>
</tr>
";

// Loop through all POST fields
foreach ($_POST as $key => $value) {

    if ($key == "formId") continue; // skip internal formId flag

    // Special handling for consent checkbox
    if ($key == 'consent') {
        $value = isset($_POST['consent']) ? "Yes" : "No";
    } else {
        // Convert arrays (checkbox groups)
        if (is_array($value)) {
            $value = implode(", ", $value);
        }
    }

    $key = htmlspecialchars($key);
    $value = htmlspecialchars($value);

    $table .= "
    <tr>
        <td style='background:#fafafa; font-weight:bold;'>$key</td>
        <td>$value</td>
    </tr>";
}

$table .= "</table>";

// Email headers
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: no-reply@ymg-legal.com\r\n";

// Send the email
mail($to, $subject, $table, $headers);

// Return success for JS handler
echo "success";
?>
