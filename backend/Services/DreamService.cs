using Microsoft.EntityFrameworkCore;
using AutoMapper;
using DreamUnlocker.Api.Data;
using DreamUnlocker.Api.Models;
using DreamUnlocker.Api.DTOs;

namespace DreamUnlocker.Api.Services;

public class DreamService : IDreamService
{
    private readonly DreamUnlockerDbContext _context;
    private readonly IMapper _mapper;

    public DreamService(DreamUnlockerDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<DreamDto> CreateDreamAsync(string userId, CreateDreamDto createDreamDto)
    {
        var dream = _mapper.Map<Dream>(createDreamDto);
        dream.UserId = userId;

        _context.Dreams.Add(dream);
        await _context.SaveChangesAsync();

        // Add emotions
        if (createDreamDto.EmotionIds.Any())
        {
            var dreamEmotions = createDreamDto.EmotionIds.Select(emotionId => new DreamEmotion
            {
                DreamId = dream.Id,
                EmotionId = emotionId,
                Intensity = 5 // Default intensity
            }).ToList();

            _context.DreamEmotions.AddRange(dreamEmotions);
        }

        // Add symbols (create if they don't exist)
        if (createDreamDto.SymbolNames.Any())
        {
            var dreamSymbols = new List<DreamSymbol>();
            
            foreach (var symbolName in createDreamDto.SymbolNames.Distinct())
            {
                var symbol = await _context.Symbols
                    .FirstOrDefaultAsync(s => s.Name.ToLower() == symbolName.ToLower());

                if (symbol == null)
                {
                    // Create new symbol with basic placeholder data
                    symbol = new Symbol
                    {
                        Name = symbolName,
                        ArchetypalMeaning = "This symbol requires interpretation.",
                        PositiveAspect = "Positive aspects to be explored.",
                        NegativeAspect = "Shadow aspects to be considered.",
                        Category = "User-Generated"
                    };
                    _context.Symbols.Add(symbol);
                    await _context.SaveChangesAsync();
                }

                dreamSymbols.Add(new DreamSymbol
                {
                    DreamId = dream.Id,
                    SymbolId = symbol.Id
                });

                // Update user symbol frequency
                await UpdateUserSymbolFrequencyAsync(userId, symbol.Id);
            }

            _context.DreamSymbols.AddRange(dreamSymbols);
        }

        await _context.SaveChangesAsync();

        // Return the created dream with all related data
        return await GetDreamByIdAsync(userId, dream.Id) ?? throw new InvalidOperationException("Failed to retrieve created dream");
    }

    public async Task<DreamDto?> GetDreamByIdAsync(string userId, int dreamId)
    {
        var dream = await _context.Dreams
            .Include(d => d.Emotions).ThenInclude(de => de.Emotion)
            .Include(d => d.Symbols).ThenInclude(ds => ds.Symbol)
            .Include(d => d.Interpretation)
            .FirstOrDefaultAsync(d => d.Id == dreamId && d.UserId == userId);

        return dream == null ? null : _mapper.Map<DreamDto>(dream);
    }

    public async Task<IEnumerable<DreamSummaryDto>> GetUserDreamsAsync(string userId, int page = 1, int pageSize = 10)
    {
        var dreams = await _context.Dreams
            .Include(d => d.Emotions)
            .Include(d => d.Symbols)
            .Include(d => d.Interpretation)
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.DreamDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return _mapper.Map<IEnumerable<DreamSummaryDto>>(dreams);
    }

    public async Task<DreamDto?> UpdateDreamAsync(string userId, int dreamId, UpdateDreamDto updateDreamDto)
    {
        var dream = await _context.Dreams
            .Include(d => d.Emotions)
            .Include(d => d.Symbols)
            .FirstOrDefaultAsync(d => d.Id == dreamId && d.UserId == userId);

        if (dream == null)
            return null;

        // Update basic properties
        if (!string.IsNullOrEmpty(updateDreamDto.Title))
            dream.Title = updateDreamDto.Title;

        if (!string.IsNullOrEmpty(updateDreamDto.Description))
            dream.Description = updateDreamDto.Description;

        if (updateDreamDto.DreamDate.HasValue)
            dream.DreamDate = updateDreamDto.DreamDate.Value;

        dream.UpdatedAt = DateTime.UtcNow;

        // Update emotions if provided
        if (updateDreamDto.EmotionIds != null)
        {
            // Remove existing emotions
            _context.DreamEmotions.RemoveRange(dream.Emotions);

            // Add new emotions
            if (updateDreamDto.EmotionIds.Any())
            {
                var dreamEmotions = updateDreamDto.EmotionIds.Select(emotionId => new DreamEmotion
                {
                    DreamId = dream.Id,
                    EmotionId = emotionId,
                    Intensity = 5
                }).ToList();

                _context.DreamEmotions.AddRange(dreamEmotions);
            }
        }

        // Update symbols if provided
        if (updateDreamDto.SymbolNames != null)
        {
            // Remove existing symbols
            _context.DreamSymbols.RemoveRange(dream.Symbols);

            // Add new symbols
            if (updateDreamDto.SymbolNames.Any())
            {
                var dreamSymbols = new List<DreamSymbol>();
                
                foreach (var symbolName in updateDreamDto.SymbolNames.Distinct())
                {
                    var symbol = await _context.Symbols
                        .FirstOrDefaultAsync(s => s.Name.ToLower() == symbolName.ToLower());

                    if (symbol == null)
                    {
                        symbol = new Symbol
                        {
                            Name = symbolName,
                            ArchetypalMeaning = "This symbol requires interpretation.",
                            PositiveAspect = "Positive aspects to be explored.",
                            NegativeAspect = "Shadow aspects to be considered.",
                            Category = "User-Generated"
                        };
                        _context.Symbols.Add(symbol);
                        await _context.SaveChangesAsync();
                    }

                    dreamSymbols.Add(new DreamSymbol
                    {
                        DreamId = dream.Id,
                        SymbolId = symbol.Id
                    });

                    await UpdateUserSymbolFrequencyAsync(userId, symbol.Id);
                }

                _context.DreamSymbols.AddRange(dreamSymbols);
            }
        }

        await _context.SaveChangesAsync();

        return await GetDreamByIdAsync(userId, dreamId);
    }

    public async Task<bool> DeleteDreamAsync(string userId, int dreamId)
    {
        var dream = await _context.Dreams
            .FirstOrDefaultAsync(d => d.Id == dreamId && d.UserId == userId);

        if (dream == null)
            return false;

        _context.Dreams.Remove(dream);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<SymbolDto>> SearchSymbolsAsync(string searchTerm)
    {
        var symbols = await _context.Symbols
            .Where(s => s.Name.ToLower().Contains(searchTerm.ToLower()))
            .OrderBy(s => s.Name)
            .Take(20)
            .ToListAsync();

        return _mapper.Map<IEnumerable<SymbolDto>>(symbols);
    }

    public async Task<IEnumerable<EmotionDto>> GetAllEmotionsAsync()
    {
        var emotions = await _context.Emotions
            .OrderBy(e => e.Name)
            .ToListAsync();

        return _mapper.Map<IEnumerable<EmotionDto>>(emotions);
    }

    private async Task UpdateUserSymbolFrequencyAsync(string userId, int symbolId)
    {
        var frequency = await _context.UserSymbolFrequencies
            .FirstOrDefaultAsync(f => f.UserId == userId && f.SymbolId == symbolId);

        if (frequency == null)
        {
            frequency = new UserSymbolFrequency
            {
                UserId = userId,
                SymbolId = symbolId,
                Frequency = 1,
                LastOccurrence = DateTime.UtcNow
            };
            _context.UserSymbolFrequencies.Add(frequency);
        }
        else
        {
            frequency.Frequency++;
            frequency.LastOccurrence = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }
}
