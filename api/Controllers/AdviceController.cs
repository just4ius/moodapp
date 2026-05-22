using Api.Data;
using Api.DTOs;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdviceController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;
        private const string OLLAMA_URL = "http://localhost:11434/api/generate";

        public AdviceController(AppDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateAdvice([FromBody] AdviceRequest request)
        {
            var history = await _context.Set<MoodEntry>()
                .Where(m => m.UserId == request.UserId)
                .OrderByDescending(m => m.CreatedAt)
                .Take(5)
                .Select(m => m.MoodLabel)
                .ToListAsync();

            string prompt = BuildPrompt(request.CurrentMood, request.Note, history);
            string advice = await CallOllama(prompt);

            var newEntry = new MoodEntry
            {
                UserId = request.UserId,
                MoodLabel = request.CurrentMood,
                Note = request.Note,
                GeneratedAdvice = advice,
                CreatedAt = DateTime.UtcNow
            };
            
            _context.Set<MoodEntry>().Add(newEntry);
            await _context.SaveChangesAsync();

            return Ok(new { advice });
        }

        [HttpGet("history/{userId}")]
        public async Task<IActionResult> GetHistory(int userId)
        {
            var entries = await _context.Set<MoodEntry>()
                .Where(m => m.UserId == userId && m.GeneratedAdvice != null)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new 
                {
                    m.Id,
                    m.MoodLabel,
                    m.Note,
                    Advice = m.GeneratedAdvice,
                    m.CreatedAt
                })
                .ToListAsync();

            return Ok(entries);
        }

        private string BuildPrompt(string currentMood, string? note, List<string> history)
        {
            var sb = new StringBuilder();
            sb.Append("Ти емпатичний психолог. Мова: Українська.");
            sb.Append($"Користувач відчуває: '{currentMood}'. ");
            
            if (!string.IsNullOrWhiteSpace(note))
            {
                sb.Append($"Деталі від користувача: '{note}'. ");
            }

            if (history.Any())
            {
                sb.Append($"Останні настрої: {string.Join(", ", history)}. ");
            }

            sb.Append("Дай коротку пораду (максимум 2 речення). Без списків, тільки текст.");
            return sb.ToString();
        }

        private async Task<string> CallOllama(string prompt)
        {
            var payload = new
            {
                model = "aya-expanse:8b", 
                prompt = prompt,
                stream = false
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            try
            {
                var response = await _httpClient.PostAsync(OLLAMA_URL, content);
                response.EnsureSuccessStatusCode();
                var jsonString = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<OllamaResponse>(jsonString);
                return result?.Response?.Trim() ?? "Слухайте себе.";
            }
            catch
            {
                return "Відпочинок важливий.";
            }
        }

        private class OllamaResponse
        {
            [JsonPropertyName("response")]
            public string Response { get; set; }
        }
    }
}