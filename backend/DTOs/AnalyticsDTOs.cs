namespace DreamUnlocker.Api.DTOs;

public class UserAnalyticsDto
{
    public int TotalDreams { get; set; }
    public int TotalSymbols { get; set; }
    public DateTime? LastDreamDate { get; set; }
    public DateTime? FirstDreamDate { get; set; }
    public List<SymbolFrequencyDto> TopSymbols { get; set; } = new();
    public List<EmotionFrequencyDto> TopEmotions { get; set; } = new();
    public List<DreamActivityDto> RecentActivity { get; set; } = new();
}

public class SymbolFrequencyDto
{
    public int SymbolId { get; set; }
    public string SymbolName { get; set; } = string.Empty;
    public int Frequency { get; set; }
    public DateTime LastOccurrence { get; set; }
    public string Category { get; set; } = string.Empty;
}

public class EmotionFrequencyDto
{
    public int EmotionId { get; set; }
    public string EmotionName { get; set; } = string.Empty;
    public int Frequency { get; set; }
    public double AverageIntensity { get; set; }
    public string Category { get; set; } = string.Empty;
}

public class DreamActivityDto
{
    public DateTime Date { get; set; }
    public int DreamCount { get; set; }
    public int SymbolCount { get; set; }
}

public class DreamPatternsDto
{
    public List<SymbolCorrelationDto> SymbolCorrelations { get; set; } = new();
    public List<EmotionalPatternDto> EmotionalPatterns { get; set; } = new();
    public List<TemporalPatternDto> TemporalPatterns { get; set; } = new();
}

public class SymbolCorrelationDto
{
    public string Symbol1 { get; set; } = string.Empty;
    public string Symbol2 { get; set; } = string.Empty;
    public int CoOccurrenceCount { get; set; }
    public double CorrelationStrength { get; set; }
}

public class EmotionalPatternDto
{
    public string EmotionName { get; set; } = string.Empty;
    public List<string> CommonSymbols { get; set; } = new();
    public double AverageIntensity { get; set; }
}

public class TemporalPatternDto
{
    public string Period { get; set; } = string.Empty; // "Morning", "Evening", "Weekend", etc.
    public int DreamCount { get; set; }
    public List<string> CommonSymbols { get; set; } = new();
    public List<string> CommonEmotions { get; set; } = new();
}
