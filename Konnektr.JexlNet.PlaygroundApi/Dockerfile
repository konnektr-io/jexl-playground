FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Konnektr.JexlNet.PlaygroundApi/Konnektr.JexlNet.PlaygroundApi.csproj", "Konnektr.JexlNet.PlaygroundApi/"]
RUN dotnet restore "Konnektr.JexlNet.PlaygroundApi/Konnektr.JexlNet.PlaygroundApi.csproj"
COPY . .
WORKDIR "/src/Konnektr.JexlNet.PlaygroundApi"
RUN dotnet publish "Konnektr.JexlNet.PlaygroundApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Konnektr.JexlNet.PlaygroundApi.dll"]
