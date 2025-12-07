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
        private readonly ILogger<UserController> _logger;

        public UserController(AppDbContext context, ILogger<UserController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            _logger.LogInformation("GetMyProfile: Request received");

            foreach (var claim in User.Claims)
            {
                _logger.LogInformation("Claim: {Type} = {Value}", claim.Type, claim.Value);
            }

            var email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;

            if (string.IsNullOrEmpty(email))
            {
                _logger.LogError("GetMyProfile: Email claim not found in token");
                return Unauthorized();
            }

            _logger.LogInformation("GetMyProfile: Resolved email: {Email}", email);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                _logger.LogError("GetMyProfile: User not found in database for email {Email}", email);
                return NotFound();
            }

            _logger.LogInformation("GetMyProfile: Returning profile for user ID {Id}", user.Id);

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
            _logger.LogInformation("UpdateProfile: Request received");

            var email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;

            if (string.IsNullOrEmpty(email))
            {
                _logger.LogError("UpdateProfile: Email claim not found");
                return Unauthorized();
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                _logger.LogError("UpdateProfile: User not found in database for email {Email}", email);
                return NotFound();
            }

            if (request.Name != null) user.Name = request.Name;
            if (request.ProfilePhoto != null) user.ProfilePhoto = request.ProfilePhoto;

            await _context.SaveChangesAsync();

            _logger.LogInformation("UpdateProfile: Successfully updated profile for {Email}", email);

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