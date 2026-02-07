namespace Aviation.Domain.ValueObjects;

public readonly record struct BoundingBox
(
    float Xmin,
    float Ymin,
    float Xmax,
    float Ymax
);