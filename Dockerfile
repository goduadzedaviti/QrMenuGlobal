# Stage 1: Build Angular Frontend
FROM node:22-alpine AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build .NET Backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-backend
WORKDIR /app
COPY *.sln .
COPY MenuManagement.API/*.csproj MenuManagement.API/
COPY MenuManagement.Application/*.csproj MenuManagement.Application/
COPY MenuManagement.Domain/*.csproj MenuManagement.Domain/
COPY MenuManagement.Infrastructure/*.csproj MenuManagement.Infrastructure/
COPY MenuManagement.Persistence/*.csproj MenuManagement.Persistence/
RUN dotnet restore

COPY . .
RUN dotnet publish MenuManagement.API/MenuManagement.API.csproj -c Release -o out

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-backend /app/out .
COPY --from=build-frontend /app/frontend/dist/frontend/browser ./wwwroot

# Create uploads directory and set permissions
RUN mkdir -p /app/wwwroot/uploads && chmod -R 777 /app/wwwroot/uploads

EXPOSE 8080
ENV ASPNETCORE_URLS=http://*:8080
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
ENTRYPOINT ["dotnet", "MenuManagement.API.dll"]
