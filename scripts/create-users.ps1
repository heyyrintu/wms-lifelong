# Appwrite User Creation Script
# Set your API key below
$API_KEY = "YOUR_API_KEY_HERE"
$ENDPOINT = "https://fra.cloud.appwrite.io/v1"
$PROJECT_ID = "695f46420013c5e5e580"

# Users to create (cc3 to cc20)
$users = @(
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

Write-Host "🚀 Creating users..." -ForegroundColor Green

$created = 0
$failed = 0

foreach ($email in $users) {
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
        $response = Invoke-WebRequest -Uri "$ENDPOINT/users" `
            -Method Post `
            -Headers @{
                "X-Appwrite-Key" = $API_KEY
                "X-Appwrite-Project" = $PROJECT_ID
                "Content-Type" = "application/json"
            } `
            -Body $body `
            -ErrorAction Stop

        Write-Host "✅ Created: $email" -ForegroundColor Green
        $created++
    }
    catch {
        $errorMsg = $_.Exception.Response.StatusCode
        if ($errorMsg -eq "Conflict") {
            Write-Host "⏭️  Skipped: $email (already exists)" -ForegroundColor Yellow
        }
        else {
            Write-Host "❌ Failed: $email - $($_.Exception.Message)" -ForegroundColor Red
            $failed++
        }
    }
    
    Start-Sleep -Milliseconds 500  # Rate limiting
}

Write-Host "`n📊 Summary: Created $created users, Failed $failed" -ForegroundColor Green
