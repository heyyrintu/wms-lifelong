Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Load .env values
$envFile = ".env"
$envVars = @{}
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line -split "=", 2
            if ($parts.Count -eq 2) {
                $key = $parts[0].Trim()
                $val = $parts[1].Trim() -replace '^["'']|["'']$', ''
                $envVars[$key] = $val
            }
        }
    }
}

$apiKey = $envVars["APPWRITE_API_KEY"]
$endpoint = $envVars["NEXT_PUBLIC_APPWRITE_ENDPOINT"]
$projectId = $envVars["NEXT_PUBLIC_APPWRITE_PROJECT_ID"]

if (-not $apiKey) { throw "APPWRITE_API_KEY missing in .env" }
if (-not $endpoint) { throw "NEXT_PUBLIC_APPWRITE_ENDPOINT missing in .env" }
if (-not $projectId) { throw "NEXT_PUBLIC_APPWRITE_PROJECT_ID missing in .env" }

$emails = @(
    "cc3@dronalogitech.com",
    "cc4@dronalogitech.com",
    "cc5@dronalogitech.com",
    "cc6@dronalogitech.com",
    "cc7@dronalogitech.com",
    "cc8@dronalogitech.com",
    "cc9@dronalogitech.com",
    "cc10@dronalogitech.com",
    "cc11@dronalogitech.com",
    "cc12@dronalogitech.com",
    "cc13@dronalogitech.com",
    "cc14@dronalogitech.com",
    "cc15@dronalogitech.com",
    "cc16@dronalogitech.com",
    "cc17@dronalogitech.com",
    "cc18@dronalogitech.com",
    "cc19@dronalogitech.com",
    "cc20@dronalogitech.com"
)

$created = 0
$skipped = 0
$failed = 0

foreach ($email in $emails) {
    $name = $email.Split("@")[0].ToUpper()
    $userId = "user_$($email.Split("@")[0])"
    $password = "Temp@$(Get-Random -Minimum 100000 -Maximum 999999)"

    $body = @{
        userId = $userId
        email = $email
        password = $password
        name = $name
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri "$endpoint/users" -Method Post -Headers @{
            "X-Appwrite-Key"      = $apiKey
            "X-Appwrite-Project"  = $projectId
            "Content-Type"        = "application/json"
        } -Body $body | Out-Null
        Write-Host "Created: $email"
        $created++
    }
    catch {
        $status = $_.Exception.Response.StatusCode.Value__
        if ($status -eq 409) {
            Write-Host "Skipped (exists): $email"
            $skipped++
        }
        else {
            Write-Host "Failed: $email (status $status)"
            $failed++
        }
    }
    Start-Sleep -Milliseconds 250
}

Write-Host "Summary -> Created: $created, Skipped: $skipped, Failed: $failed"
