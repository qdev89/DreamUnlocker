using DreamUnlocker.Api.DTOs;

namespace DreamUnlocker.Api.Services;

public interface IAnalyticsService
{
    Task<UserAnalyticsDto> GetUserAnalyticsAsync(string userId);
    Task<IEnumerable<SymbolFrequencyDto>> GetTopSymbolsAsync(string userId, int count = 10);
    Task<IEnumerable<EmotionFrequencyDto>> GetTopEmotionsAsync(string userId, int count = 10);
    Task<DreamPatternsDto> GetDreamPatternsAsync(string userId);
    Task<IEnumerable<DreamActivityDto>> GetDreamActivityAsync(string userId, int days = 30);
}
