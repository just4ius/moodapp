using Microsoft.AspNetCore.Mvc;
using Api.Data;
using Api.Models;
using Api.Services;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;
        private readonly JwtService _jwtService;

        public AuthController(AppDbContext context, EmailService emailService, JwtService jwtService)
        {
            _context = context;
            _emailService = emailService;
            _jwtService = jwtService;
        }

        // 🔹 1. Якщо користувач існує → логін; якщо ні → надіслати код
        [HttpPost("login-or-sendcode")]
        public async Task<IActionResult> LoginOrSendCode([FromBody] LoginRequest request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            var code = new Random().Next(100000, 999999).ToString();

            if (user != null)
            {
                // Оновлюємо код навіть якщо вже зареєстрований
                user.VerificationCode = code;
                await _context.SaveChangesAsync();

                await _emailService.SendVerificationCodeAsync(request.Email, code);

                return Ok(new { message = "З поверненням! Код підтвердження відправлено." });
            }
            else
            {
                var newUser = new User
                {
                    Email = request.Email,
                    VerificationCode = code,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                await _emailService.SendVerificationCodeAsync(request.Email, code);

                return Ok(new { message = "Вітаємо! Код підтвердження відправлено." });
            }
        }

        // 🔹 2. Підтвердження коду
        [HttpPost("verify")]
        public async Task<IActionResult> Verify([FromBody] VerifyRequest request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            if (user == null) return NotFound(new { message = "Користувача не знайдено" });

            if (user.VerificationCode == request.Code)
            {
                user.IsVerified = true;
                user.VerificationCode = null;
                user.LastLogin = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                var token = _jwtService.GenerateToken(user.Email);
                return Ok(new { message = "Email підтверджено", token });
            }

            return BadRequest(new { message = "Невірний код підтвердження" });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
    }

    public class VerifyRequest
    {
        public string Email { get; set; }
        public string Code { get; set; }
    }
}
