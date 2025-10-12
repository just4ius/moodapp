using Api.Data;
using Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 36))
    ));

builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<JwtService>();

builder.Services.AddHttpClient();
builder.Services.AddScoped<OllamaService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalNetwork",
        policy => policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowLocalNetwork");

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run("http://0.0.0.0:5051");
