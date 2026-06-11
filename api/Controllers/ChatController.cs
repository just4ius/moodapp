using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly OllamaService _ollamaService;
    private readonly AppDbContext _context;
    private readonly ILogger<ChatController> _logger;

    public ChatController(OllamaService ollamaService, AppDbContext context, ILogger<ChatController> logger)
    {
        _ollamaService = ollamaService;
        _context = context;
        _logger = logger;
    }

    [HttpPost]
    public async Task Post([FromBody] ChatRequest request)
    {
        Response.ContentType = "application/x-ndjson; charset=utf-8";
        Response.StatusCode = 200;

        try
        {
            var user = await ResolveCurrentUserAsync(HttpContext.RequestAborted);
            if (user == null)
            {
                Response.StatusCode = 401;
                return;
            }

            var moodContext = await BuildMoodContextAsync(user.Id, HttpContext.RequestAborted);
            var safetyInstruction = "Якщо питання медичне чи користувачеві щось болить фізично, то порекомендуй користувачеві звернутися до фахівця на початку відповіді.";
            var fullPrompt = $"{safetyInstruction}\n\n{moodContext}\n\nПитання користувача: {request.Prompt}";

            await foreach (var chunk in _ollamaService.SendMessageStreamAsync(fullPrompt, HttpContext.RequestAborted))
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

    private async Task<User?> ResolveCurrentUserAsync(CancellationToken cancellationToken)
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;

        if (string.IsNullOrWhiteSpace(email))
        {
            return null;
        }

        return await _context.Users.FirstOrDefaultAsync(user => user.Email == email, cancellationToken);
    }

    private async Task<string> BuildMoodContextAsync(int userId, CancellationToken cancellationToken)
    {
        var cutoff = DateTime.UtcNow.AddDays(-5);

        var entries = await _context.Set<MoodEntry>()
            .Where(entry => entry.UserId == userId && entry.CreatedAt >= cutoff)
            .OrderBy(entry => entry.CreatedAt)
            .Select(entry => new
            {
                entry.MoodLabel,
                entry.Note,
                entry.CreatedAt
            })
            .ToListAsync(cancellationToken);

        if (!entries.Any())
        {
            return "Внутрішній контекст: за останні 5 днів немає збережених даних про настрій користувача. Ураховуй лише поточний запит і не згадуй відсутність історії у відповіді.";
        }

        var recentMoodLines = entries
            .Select(entry => $"{entry.CreatedAt:yyyy-MM-dd}: {entry.MoodLabel}{(string.IsNullOrWhiteSpace(entry.Note) ? string.Empty : $" | {entry.Note}")}")
            .ToList();

        var firstScore = GetMoodScore(entries.First().MoodLabel);
        var lastScore = GetMoodScore(entries.Last().MoodLabel);
        var trend = lastScore > firstScore ? "покращився" : lastScore < firstScore ? "погіршився" : "залишився приблизно стабільним";

        var sb = new StringBuilder();
        sb.Append("Внутрішній контекст: за останні 5 днів настрій користувача був таким: ");
        sb.Append(string.Join("; ", recentMoodLines));
        sb.Append(". ");
        sb.Append($"Загальна динаміка за цей період: {trend}. ");
        sb.Append("Використовуй цей контекст приховано, без згадування технічних деталей або повного логу в відповіді.");

        return sb.ToString();
    }

    private static int GetMoodScore(string moodLabel)
    {
        return moodLabel switch
        {
            "Чудовий" => 2,
            "Добре" => 1,
            "Ніякий" => 0,
            "Сумний" => -1,
            "Втомлений" => -1,
            "Тривожний" => -2,
            "Злий" => -2,
            _ => 0
        };
    }
}

public class ChatRequest
{
    public required string Prompt { get; set; }
}