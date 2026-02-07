using Aviation.Application.Dtos.Ai;

namespace Aviation.Application.Interfaces;

public interface IAiDetectionReader
{
    Task<IReadOnlyList<ImageDetectionFileDto>> ReadAsync(string source);
}