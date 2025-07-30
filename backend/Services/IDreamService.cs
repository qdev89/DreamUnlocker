using DreamUnlocker.Api.DTOs;
using DreamUnlocker.Api.Models;

namespace DreamUnlocker.Api.Services;

public interface IDreamService
{
    Task<DreamDto> CreateDreamAsync(string userId, CreateDreamDto createDreamDto);
    Task<DreamDto?> GetDreamByIdAsync(string userId, int dreamId);
    Task<IEnumerable<DreamSummaryDto>> GetUserDreamsAsync(string userId, int page = 1, int pageSize = 10);
    Task<DreamDto?> UpdateDreamAsync(string userId, int dreamId, UpdateDreamDto updateDreamDto);
    Task<bool> DeleteDreamAsync(string userId, int dreamId);
    Task<IEnumerable<SymbolDto>> SearchSymbolsAsync(string searchTerm);
    Task<IEnumerable<EmotionDto>> GetAllEmotionsAsync();
}
