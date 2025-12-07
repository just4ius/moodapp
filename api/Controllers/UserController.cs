using Api.Data;
using Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email)) return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return NotFound();

            return Ok(new UserProfileResponse
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                ProfilePhoto = user.ProfilePhoto
            });
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileRequest request)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email)) return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return NotFound();

            if (request.Name != null) user.Name = request.Name;
            if (request.ProfilePhoto != null) user.ProfilePhoto = request.ProfilePhoto;

            await _context.SaveChangesAsync();

            return Ok(new UserProfileResponse
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                ProfilePhoto = user.ProfilePhoto
            });
        }
    }
}