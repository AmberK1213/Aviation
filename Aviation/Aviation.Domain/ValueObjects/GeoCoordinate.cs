using System;

namespace Aviation.Domain.ValueObjects;

public record GeoCoordinate
{
    public double Latitude { get; }
    public double Longitude { get; }

    public GeoCoordinate(double latitude, double longitude)
    {
        if (latitude < -90 || latitude > 90)
            throw new ArgumentOutOfRangeException(nameof(latitude));
        if (longitude < -180 || longitude > 180)
            throw new ArgumentOutOfRangeException(nameof(longitude));

        Latitude = latitude;
        Longitude = longitude;
    }
}