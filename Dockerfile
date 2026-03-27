FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy and restore
COPY *.sln .
COPY MenuManagement.API/*.csproj MenuManagement.API/
COPY MenuManagement.Application/*.csproj MenuManagement.Application/
COPY MenuManagement.Domain/*.csproj MenuManagement.Domain/
COPY MenuManagement.Infrastructure/*.csproj MenuManagement.Infrastructure/
COPY MenuManagement.Persistence/*.csproj MenuManagement.Persistence/
RUN dotnet restore

# Copy and build
COPY . .
RUN dotnet publish MenuManagement.API/MenuManagement.API.csproj -c Release -o out

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Create uploads directory and set permissions
RUN mkdir -p /app/wwwroot/uploads && chmod -R 777 /app/wwwroot/uploads

EXPOSE 8080
ENV ASPNETCORE_URLS=http://*:8080
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
ENTRYPOINT ["dotnet", "MenuManagement.API.dll"]
