using Microsoft.EntityFrameworkCore;
using DreamUnlocker.Api.Data;
using DreamUnlocker.Api.DTOs;

namespace DreamUnlocker.Api.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly DreamUnlockerDbContext _context;

    public AnalyticsService(DreamUnlockerDbContext context)
    {
        _context = context;
    }

    public async Task<UserAnalyticsDto> GetUserAnalyticsAsync(string userId)
    {
        var dreams = await _context.Dreams
            .Where(d => d.UserId == userId)
            .ToListAsync();

        var totalDreams = dreams.Count;
        var firstDream = dreams.OrderBy(d => d.DreamDate).FirstOrDefault();
        var lastDream = dreams.OrderByDescending(d => d.DreamDate).FirstOrDefault();

        var topSymbols = await GetTopSymbolsAsync(userId, 5);
        var topEmotions = await GetTopEmotionsAsync(userId, 5);
        var recentActivity = await GetDreamActivityAsync(userId, 7);

        var totalSymbols = await _context.UserSymbolFrequencies
            .Where(f => f.UserId == userId)
            .CountAsync();

        return new UserAnalyticsDto
        {
            TotalDreams = totalDreams,
            TotalSymbols = totalSymbols,
            FirstDreamDate = firstDream?.DreamDate,
            LastDreamDate = lastDream?.DreamDate,
            TopSymbols = topSymbols.ToList(),
            TopEmotions = topEmotions.ToList(),
            RecentActivity = recentActivity.ToList()
        };
    }

    public async Task<IEnumerable<SymbolFrequencyDto>> GetTopSymbolsAsync(string userId, int count = 10)
    {
        return await _context.UserSymbolFrequencies
            .Include(f => f.Symbol)
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.Frequency)
            .Take(count)
            .Select(f => new SymbolFrequencyDto
            {
                SymbolId = f.SymbolId,
                SymbolName = f.Symbol.Name,
                Frequency = f.Frequency,
                LastOccurrence = f.LastOccurrence,
                Category = f.Symbol.Category
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<EmotionFrequencyDto>> GetTopEmotionsAsync(string userId, int count = 10)
    {
        return await _context.DreamEmotions
            .Include(de => de.Emotion)
            .Include(de => de.Dream)
            .Where(de => de.Dream.UserId == userId)
            .GroupBy(de => new { de.EmotionId, de.Emotion.Name, de.Emotion.Category })
            .Select(g => new EmotionFrequencyDto
            {
                EmotionId = g.Key.EmotionId,
                EmotionName = g.Key.Name,
                Frequency = g.Count(),
                AverageIntensity = g.Average(de => de.Intensity),
                Category = g.Key.Category
            })
            .OrderByDescending(e => e.Frequency)
            .Take(count)
            .ToListAsync();
    }

    public async Task<DreamPatternsDto> GetDreamPatternsAsync(string userId)
    {
        // Get symbol correlations
        var symbolCorrelations = await GetSymbolCorrelationsAsync(userId);
        
        // Get emotional patterns
        var emotionalPatterns = await GetEmotionalPatternsAsync(userId);
        
        // Get temporal patterns (simplified for MVP)
        var temporalPatterns = await GetTemporalPatternsAsync(userId);

        return new DreamPatternsDto
        {
            SymbolCorrelations = symbolCorrelations.ToList(),
            EmotionalPatterns = emotionalPatterns.ToList(),
            TemporalPatterns = temporalPatterns.ToList()
        };
    }

    public async Task<IEnumerable<DreamActivityDto>> GetDreamActivityAsync(string userId, int days = 30)
    {
        var startDate = DateTime.UtcNow.AddDays(-days).Date;
        
        return await _context.Dreams
            .Include(d => d.Symbols)
            .Where(d => d.UserId == userId && d.DreamDate >= startDate)
            .GroupBy(d => d.DreamDate.Date)
            .Select(g => new DreamActivityDto
            {
                Date = g.Key,
                DreamCount = g.Count(),
                SymbolCount = g.Sum(d => d.Symbols.Count)
            })
            .OrderBy(a => a.Date)
            .ToListAsync();
    }

    private async Task<IEnumerable<SymbolCorrelationDto>> GetSymbolCorrelationsAsync(string userId)
    {
        // Find symbols that appear together in dreams
        var dreamSymbols = await _context.DreamSymbols
            .Include(ds => ds.Dream)
            .Include(ds => ds.Symbol)
            .Where(ds => ds.Dream.UserId == userId)
            .ToListAsync();

        var correlations = new List<SymbolCorrelationDto>();
        
        var dreamGroups = dreamSymbols.GroupBy(ds => ds.DreamId);
        
        foreach (var dreamGroup in dreamGroups)
        {
            var symbols = dreamGroup.ToList();
            for (int i = 0; i < symbols.Count; i++)
            {
                for (int j = i + 1; j < symbols.Count; j++)
                {
                    var symbol1 = symbols[i].Symbol.Name;
                    var symbol2 = symbols[j].Symbol.Name;
                    
                    var existing = correlations.FirstOrDefault(c => 
                        (c.Symbol1 == symbol1 && c.Symbol2 == symbol2) ||
                        (c.Symbol1 == symbol2 && c.Symbol2 == symbol1));
                    
                    if (existing != null)
                    {
                        existing.CoOccurrenceCount++;
                    }
                    else
                    {
                        correlations.Add(new SymbolCorrelationDto
                        {
                            Symbol1 = symbol1,
                            Symbol2 = symbol2,
                            CoOccurrenceCount = 1,
                            CorrelationStrength = 0.0 // Calculate this based on frequency
                        });
                    }
                }
            }
        }

        return correlations.Where(c => c.CoOccurrenceCount > 1)
                          .OrderByDescending(c => c.CoOccurrenceCount)
                          .Take(10);
    }

    private async Task<IEnumerable<EmotionalPatternDto>> GetEmotionalPatternsAsync(string userId)
    {
        return await _context.DreamEmotions
            .Include(de => de.Emotion)
            .Include(de => de.Dream)
                .ThenInclude(d => d.Symbols)
                    .ThenInclude(ds => ds.Symbol)
            .Where(de => de.Dream.UserId == userId)
            .GroupBy(de => de.Emotion.Name)
            .Select(g => new EmotionalPatternDto
            {
                EmotionName = g.Key,
                AverageIntensity = g.Average(de => de.Intensity),
                CommonSymbols = g.SelectMany(de => de.Dream.Symbols.Select(ds => ds.Symbol.Name))
                                .GroupBy(s => s)
                                .OrderByDescending(sg => sg.Count())
                                .Take(5)
                                .Select(sg => sg.Key)
                                .ToList()
            })
            .ToListAsync();
    }

    private async Task<IEnumerable<TemporalPatternDto>> GetTemporalPatternsAsync(string userId)
    {
        // Simplified temporal analysis - group by day of week
        return await _context.Dreams
            .Include(d => d.Symbols).ThenInclude(ds => ds.Symbol)
            .Include(d => d.Emotions).ThenInclude(de => de.Emotion)
            .Where(d => d.UserId == userId)
            .GroupBy(d => d.DreamDate.DayOfWeek)
            .Select(g => new TemporalPatternDto
            {
                Period = g.Key.ToString(),
                DreamCount = g.Count(),
                CommonSymbols = g.SelectMany(d => d.Symbols.Select(ds => ds.Symbol.Name))
                                .GroupBy(s => s)
                                .OrderByDescending(sg => sg.Count())
                                .Take(3)
                                .Select(sg => sg.Key)
                                .ToList(),
                CommonEmotions = g.SelectMany(d => d.Emotions.Select(de => de.Emotion.Name))
                                .GroupBy(e => e)
                                .OrderByDescending(eg => eg.Count())
                                .Take(3)
                                .Select(eg => eg.Key)
                                .ToList()
            })
            .ToListAsync();
    }
}
