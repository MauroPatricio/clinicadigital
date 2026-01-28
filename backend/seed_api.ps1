$headers = @{
    "Content-Type" = "application/json"
    # Authorization header might be needed if I can get a token, 
    # but I recall createDoctor is Admin only. 
    # I might need to login first to get token.
    # But wait, createDoctor uses `authorize('admin')`.
    # I MUST login as admin first.
}

# 1. Login
$loginBody = @{
    email    = "admin@clinica.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login Successful. Token obtained."
    $headers["Authorization"] = "Bearer $token"
}
catch {
    Write-Host "Login Failed: $_"
    exit
}

# 2. Create Doctor
$doctorBody = @{
    firstName      = "Jane"
    lastName       = "Smith"
    email          = "jane.smith@cl.com"
    phone          = "555-0101"
    password       = "password123"
    specialization = "cardiologia"
    licenseNumber  = "DOC12345"
    doctorNumber   = "DOC000001"
} | ConvertTo-Json

try {
    $docResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/doctors" -Method Post -Headers $headers -Body $doctorBody -ContentType "application/json"
    Write-Host "Doctor Created: $($docResponse.data.user.profile.firstName) $($docResponse.data.user.profile.lastName)"
}
catch {
    Write-Host "Create Doctor Failed (might exist): $_"
}

# 3. Create Patient
$patientBody = @{
    firstName     = "Alice"
    lastName      = "Wonder"
    email         = "alice.wonder@cl.com"
    phone         = "555-0202"
    password      = "password123"
    dateOfBirth   = "1990-01-01"
    gender        = "female"
    patientNumber = "PAT000001"
    address       = @{
        street     = "123 Wonderland"
        city       = "Fantasy"
        state      = "FC"
        postalCode = "12345"
    }
    bloodType     = "A+"
    insurance     = @{
        provider     = "Health"
        policyNumber = "123"
    }
} | ConvertTo-Json

try {
    $patResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/patients" -Method Post -Headers $headers -Body $patientBody -ContentType "application/json"
    Write-Host "Patient Created: $($patResponse.data.patientNumber)"
}
catch {
    Write-Host "Create Patient Failed (might exist): $_"
}
