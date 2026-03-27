# Menu Management System

The project now uses PostgreSQL for both local development and production.

## Local setup

### 1. Start PostgreSQL
Create a local database with these default values, or update the connection string in [appsettings.Development.json](/c:/Users/ladop/QrMenuSystem/MenuManagement.API/appsettings.Development.json):

- Host: `localhost`
- Port: `5432`
- Database: `qrmenusystem_dev`
- Username: `postgres`
- Password: `postgres`

### 2. Run the backend
From the repository root:

```bash
dotnet restore
dotnet run --project MenuManagement.API
```

The API runs on `http://localhost:5223` by default. On startup it applies migrations automatically and seeds demo data.

### 3. Run the frontend
From [frontend](/c:/Users/ladop/QrMenuSystem/frontend):

```bash
npm ci
npm start
```

Open `http://localhost:4200`.

## Default local admin login

- Username: `admin`
- Password: `admin123`

## Production on Render

The repository includes [render.yaml](/c:/Users/ladop/QrMenuSystem/render.yaml) for automatic deploys.

Backend configuration on Render:

- `DATABASE_URL` comes from the managed Render PostgreSQL instance
- `ASPNETCORE_ENVIRONMENT=Production`
- `JwtSettings__Key` is generated automatically
- `JwtSettings__Issuer=MenuManagementAPI`
- `JwtSettings__Audience=MenuManagementFrontend`
- `Cors__AllowedOrigins__0=https://qrmenu-frontend.onrender.com`

Frontend production API URL is defined in [environment.prod.ts](/c:/Users/ladop/QrMenuSystem/frontend/src/environments/environment.prod.ts) and points to the Render backend URL.

## Notes

- Local development uses `appsettings.Development.json`
- Production uses `appsettings.Production.json` plus Render environment variables
- Uploads are persisted on Render disk at `/app/wwwroot/uploads`
