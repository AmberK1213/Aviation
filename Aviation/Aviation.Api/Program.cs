using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Serve annotated detection images from outputs/visuals at /outputs/visuals/...
var outputsPath = Path.Combine(builder.Environment.ContentRootPath, "outputs");
if (Directory.Exists(outputsPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(outputsPath),
        RequestPath = "/outputs"
    });
}

app.UseCors("FrontendDev");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
