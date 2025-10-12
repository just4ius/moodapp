using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly OllamaService _ollamaService;
    private readonly ILogger<ChatController> _logger;

    public ChatController(OllamaService ollamaService, ILogger<ChatController> logger)
    {
        _ollamaService = ollamaService;
        _logger = logger;
    }

    [HttpPost]
    public async Task Post([FromBody] ChatRequest request)
    {
        Response.ContentType = "application/x-ndjson; charset=utf-8";
        Response.StatusCode = 200;

        try
        {
            await foreach (var chunk in _ollamaService.SendMessageStreamAsync(request.Prompt, HttpContext.RequestAborted))
            {
                await Response.WriteAsync(JsonSerializer.Serialize(chunk), HttpContext.RequestAborted);
                await Response.WriteAsync("\n", HttpContext.RequestAborted);
                await Response.Body.FlushAsync(HttpContext.RequestAborted);
            }
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("Request was cancelled");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat request");
            if (!Response.HasStarted)
            {
                 Response.StatusCode = 500;
            }
        }
    }
}

public class ChatRequest
{
    public required string Prompt { get; set; }
}