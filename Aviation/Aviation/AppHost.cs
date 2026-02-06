var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.Aviation_Api>("aviation-api");

builder.Build().Run();
