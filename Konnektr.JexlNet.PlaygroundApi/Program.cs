using System.Text.Json;
using System.Text.Json.Nodes;
using JexlNet;
using Konnektr.JexlNet.PlaygroundApi.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});
var app = builder.Build();
var jexl = new Jexl(new ExtendedGrammar());

app.MapPost(
    "/evaluate",
    async (HttpRequest request) =>
    {
        try
        {
            var body = await JsonSerializer.DeserializeAsync<EvalRequest>(
                request.Body,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );
            if (body == null)
                return Results.Json(
                    new EvalResponse { Result = null, Error = "Invalid request body" }
                );

            var result = await jexl.EvalAsync(body.Expression, body.Context);
            return Results.Json(new EvalResponse { Result = result, Error = null });
        }
        catch (Exception ex)
        {
            return Results.Json(new EvalResponse { Result = null, Error = ex.Message });
        }
    }
);

app.MapGet(
    "/healthz",
    () => Results.Json(new { status = "ok", message = "JexlNet.ExtendedGrammar API running" })
);

app.Run();
