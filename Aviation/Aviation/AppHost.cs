using Aspire.Hosting.Postgres;

var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.Aviation_Api>("aviation-api");

builder.AddNpmApp("aviation-frontend", "../Interactive Geospatial AI Dashboard", "dev")
    .WithReference(api)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();
