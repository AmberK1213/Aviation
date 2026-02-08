using Aviation.Application.Interfaces;
using Aviation.Infrastructure.Ai;
using Aviation.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register IAiDetectionReader for DI
builder.Services.AddScoped<IAiDetectionReader, FileSystemAiDetectionReader>();

// Temporarily disable PostgreSQL to save memory during prototyping
// Uncomment when ready to use database:
// builder.Services.AddDbContext<AviationDbContext>(options =>
//     options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection") ??
//         "Host=localhost;Port=5432;Database=aviationdb;Username=aviationuser;Password=aviationpw"));

// Add CORS for frontend - allow all localhost ports for development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin => 
                new Uri(origin).Host == "localhost" || 
                new Uri(origin).Host == "127.0.0.1")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

// Serve static files from wwwroot
app.UseStaticFiles();

// Serve debug images from outputs/debug folder at /images/debug URL
var debugImagePath = builder.Configuration.GetValue<string>("DebugImageFolderPath");
if (!string.IsNullOrEmpty(debugImagePath))
{
    // Resolve the path relative to the project directory
    var fullPath = Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, debugImagePath));
    
    app.Logger.LogInformation("Debug image path: {FullPath}", fullPath);
    app.Logger.LogInformation("Directory exists: {Exists}", Directory.Exists(fullPath));
    
    if (Directory.Exists(fullPath))
    {
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(fullPath),
            RequestPath = "/images/debug"
        });
        app.Logger.LogInformation("Static file serving enabled for /images/debug -> {Path}", fullPath);
    }
    else
    {
        app.Logger.LogWarning("Debug image directory does not exist: {Path}", fullPath);
    }
}

app.UseAuthorization();

app.MapControllers();

app.Run();
