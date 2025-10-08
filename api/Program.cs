using Api.Data;
using Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// --- Controllers & Swagger ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- MySQL connection ---
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 36))
    ));

// --- Custom services ---
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<JwtService>();

// --- CORS для доступу з мобільного ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalNetwork",
        policy => policy
            .AllowAnyOrigin()   // можна замінити на конкретний IP, наприклад AllowOrigins("http://192.168.0.105:19000")
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

// --- Swagger у режимі розробки ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// --- Підключаємо CORS ---
app.UseCors("AllowLocalNetwork");

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

// --- Слухаємо всі IP у мережі ---
app.Run("http://0.0.0.0:5051");
