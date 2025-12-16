using System.Text.Json;
using System.Text.Json.Nodes;

namespace Konnektr.JexlNet.PlaygroundApi.Models;

public class EvalRequest
{
    public string Expression { get; set; } = string.Empty;
    public JsonObject Context { get; set; } = new();
}

public class EvalResponse
{
    public JsonNode? Result { get; set; }
    public string? Error { get; set; }
}
