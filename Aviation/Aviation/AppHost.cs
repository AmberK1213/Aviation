var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.Aviation_Api>("aviation-api");

// Python FastAPI service — YOLO + Gemini inference
var aiService = builder.AddExecutable(
        "aviation-ai",
        "python",                    // command
        "../Aviation.Ai",            // working directory
        "-m", "uvicorn", "main:app", // args
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload")
    .WithHttpEndpoint(port: 8000, name: "http")
    .WithEnvironment("GEMINI_API_KEY", builder.Configuration["GEMINI_API_KEY"] ?? "");

var aiEndpoint = aiService.GetEndpoint("http");

builder.AddNpmApp("aviation-frontend", "../Interactive Geospatial AI Dashboard", "dev")
    .WithReference(api)
    .WithEnvironment("VITE_AI_URL", aiEndpoint)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();
