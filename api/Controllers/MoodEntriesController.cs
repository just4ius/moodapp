using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoodEntriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MoodEntriesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserHistory(int userId)
        {
            var entries = await _context.Set<MoodEntry>()
                .Where(m => m.UserId == userId)
                .OrderBy(m => m.CreatedAt)
                .Select(m => new 
                {
                    m.Id,
                    m.MoodLabel,
                    m.Note,
                    m.CreatedAt
                })
                .ToListAsync();

            return Ok(entries);
        }
    }
}