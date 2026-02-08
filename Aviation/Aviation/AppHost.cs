using Aspire.Hosting.Postgres;

var builder = DistributedApplication.CreateBuilder(args);

// Temporarily disable PostgreSQL to save memory during prototyping
// Uncomment when ready to use database:
// var postgres = builder.AddPostgres("postgres")
//     .AddDatabase("aviationdb");

var api = builder.AddProject<Projects.Aviation_Api>("aviation-api");
    // .WithReference(postgres);  // Uncomment when using PostgreSQL

// Frontend runs separately with: npm run dev (in Interactive Geospatial AI Dashboard folder)
// This avoids Docker memory issues during prototyping

builder.Build().Run();
