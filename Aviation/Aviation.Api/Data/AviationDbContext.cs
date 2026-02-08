using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL;

namespace Aviation.Api.Data;

public class AviationDbContext : DbContext
{
    public AviationDbContext(DbContextOptions<AviationDbContext> options) : base(options) {}

    public DbSet<DetectionEntity> Detections { get; set; }
    public DbSet<NestingSiteEntity> NestingSites { get; set; }
}

public class DetectionEntity
{
    public int Id { get; set; }
    public string ImageId { get; set; } = default!;
    public string Name { get; set; } = default!;
    public double Confidence { get; set; }
    public float Xmin { get; set; }
    public float Ymin { get; set; }
    public float Xmax { get; set; }
    public float Ymax { get; set; }
}

public class NestingSiteEntity
{
    public int Id { get; set; }
    public string Species { get; set; } = default!;
    public double Lat { get; set; }
    public double Lng { get; set; }
    public int Abundance { get; set; }
    public string Priority { get; set; } = default!;
    public string Habitat { get; set; } = default!;
    public string LastSurveyed { get; set; } = default!;
    public double Confidence { get; set; }
    public string VerificationStatus { get; set; } = default!;
    public string DetectionType { get; set; } = default!;
    public string? ImageId { get; set; }
}
