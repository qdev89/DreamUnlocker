using DreamUnlocker.Api.DTOs;

namespace DreamUnlocker.Api.Services;

public interface IInterpretationService
{
    Task<DreamInterpretationDto> GenerateInterpretationAsync(string userId, CreateInterpretationDto request);
    Task<DreamInterpretationDto?> GetInterpretationAsync(string userId, int dreamId);
    Task<IEnumerable<InterpretationThemeDto>> GetCommonThemesAsync();
    Task<IEnumerable<PersonalSymbolPatternDto>> GetPersonalSymbolPatternsAsync(string userId);
    Task<IEnumerable<string>> GenerateExploratoryQuestionsAsync(string userId, int dreamId);
    Task<ShadowWorkDto> GenerateShadowWorkAsync(string userId, int dreamId);
}
