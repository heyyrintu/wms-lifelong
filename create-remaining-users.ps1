# Set your credentials
$API_KEY = "YOUR_API_KEY_HERE"  # Get from Appwrite Console
$ENDPOINT = "https://fra.cloud.appwrite.io/v1"
$PROJECT_ID = "695f46420013c5e5e580"

# Emails to create (cc3-cc20)
$emails = "cc3@dronalogitech.com", "cc4@dronalogitech.com", "cc5@dronalogitech.com", `
          "cc6@dronalogitech.com", "cc7@dronalogitech.com", "cc8@dronalogitech.com", `
          "cc9@dronalogitech.com", "cc10@dronalogitech.com", "cc11@dronalogitech.com", `
          "cc12@dronalogitech.com", "cc13@dronalogitech.com", "cc14@dronalogitech.com", `
          "cc15@dronalogitech.com", "cc16@dronalogitech.com", "cc17@dronalogitech.com", `
          "cc18@dronalogitech.com", "cc19@dronalogitech.com", "cc20@dronalogitech.com"

foreach ($email in $emails) {
    $name = $email.Split("@")[0].ToUpper()
    $userId = "user_$($email.Split("@")[0])"
    $password = "Temp@$(Get-Random -Minimum 100000 -Maximum 999999)"
    
    $json = @{
        userId = $userId
        email = $email
        password = $password
        name = $name
    } | ConvertTo-Json
    
    Write-Host "Creating $email..." -ForegroundColor Cyan
    
    curl.exe -X POST "$ENDPOINT/users" `
        -H "X-Appwrite-Key: $API_KEY" `
        -H "X-Appwrite-Project: $PROJECT_ID" `
        -H "Content-Type: application/json" `
        -d $json
    
    Write-Host ""
    Start-Sleep -Milliseconds 300
}
