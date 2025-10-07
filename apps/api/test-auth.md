# Pruebas de Autenticación - Sorty API

## Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/health" -Method GET
```

## Registro de Usuario
```powershell
$registerBody = @{
    email = "test@example.com"
    password = "123456"
    role = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
```

## Login de Usuario
```powershell
$loginBody = @{
    email = "test@example.com"
    password = "123456"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.token
Write-Host "Token: $token"
```

## Verificar Usuario Autenticado
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:4000/auth/me" -Method GET -Headers $headers
```

## Acceder a Assets (protegido)
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/assets" -Method GET -Headers $headers
```

## Intentar acceso sin token (debe fallar)
```powershell
try {
    Invoke-RestMethod -Uri "http://localhost:4000/assets" -Method GET
} catch {
    Write-Host "Error esperado: $($_.Exception.Message)"
}
```