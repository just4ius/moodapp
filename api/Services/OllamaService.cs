using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

public class OllamaService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<OllamaService> _logger;

    public OllamaService(IHttpClientFactory httpClientFactory, ILogger<OllamaService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async IAsyncEnumerable<OllamaStreamResponse> SendMessageStreamAsync(
        string prompt,
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient();
        var ollamaApiUrl = "http://localhost:11434/api/generate";

        var requestData = new
        {
            model = "aya-expanse:8b",
            prompt = prompt,
            stream = true
        };

        var content = new StringContent(JsonSerializer.Serialize(requestData), Encoding.UTF8, "application/json");
        var request = new HttpRequestMessage(HttpMethod.Post, ollamaApiUrl) { Content = content };

        var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        response.EnsureSuccessStatusCode();

        using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var reader = new StreamReader(stream);

        while (!reader.EndOfStream && !cancellationToken.IsCancellationRequested)
        {
            var line = await reader.ReadLineAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(line)) continue;

            var ollamaChunk = JsonSerializer.Deserialize<OllamaStreamResponse>(line);
            if (ollamaChunk != null)
            {
                yield return ollamaChunk;
            }
        }
    }
}

public class OllamaStreamResponse
{
    [JsonPropertyName("response")]
    public required string Response { get; set; }

    [JsonPropertyName("done")]
    public bool Done { get; set; }
}