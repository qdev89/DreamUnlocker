using System.ComponentModel.DataAnnotations;

namespace DreamUnlocker.Api.DTOs;

public class CreateDreamDto
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(5000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime DreamDate { get; set; }

    public List<int> EmotionIds { get; set; } = new();
    public List<string> SymbolNames { get; set; } = new();
}

public class UpdateDreamDto
{
    [StringLength(200)]
    public string? Title { get; set; }

    [StringLength(5000)]
    public string? Description { get; set; }

    public DateTime? DreamDate { get; set; }
    public List<int>? EmotionIds { get; set; }
    public List<string>? SymbolNames { get; set; }
}

public class DreamDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DreamDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<EmotionDto> Emotions { get; set; } = new();
    public List<SymbolDto> Symbols { get; set; } = new();
    public DreamInterpretationDto? Interpretation { get; set; }
}

public class DreamSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime DreamDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public int EmotionCount { get; set; }
    public int SymbolCount { get; set; }
    public bool HasInterpretation { get; set; }
}

public class EmotionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int Intensity { get; set; }
}

public class SymbolDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ArchetypalMeaning { get; set; } = string.Empty;
    public string PositiveAspect { get; set; } = string.Empty;
    public string NegativeAspect { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? UserContext { get; set; }
}

public class DreamInterpretationDto
{
    public int DreamId { get; set; }
    public string OverallTheme { get; set; } = string.Empty;
    public string PrimaryMessage { get; set; } = string.Empty;
    public List<SymbolInterpretationDto> SymbolInterpretations { get; set; } = new();
    public List<EmotionalInsightDto> EmotionalInsights { get; set; } = new();
    public List<string> ExploratoryQuestions { get; set; } = new();
    public ShadowWorkDto ShadowWork { get; set; } = new();
    public string IntegrationSuggestion { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class SymbolInterpretationDto
{
    public int SymbolId { get; set; }
    public string SymbolName { get; set; } = string.Empty;
    public string ArchetypalMeaning { get; set; } = string.Empty;
    public string PersonalizedInterpretation { get; set; } = string.Empty;
    public string LightAspect { get; set; } = string.Empty;
    public string ShadowAspect { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int UserFrequency { get; set; }
    public List<string> RelatedSymbols { get; set; } = new();
}

public class EmotionalInsightDto
{
    public string EmotionName { get; set; } = string.Empty;
    public int Intensity { get; set; }
    public string Insight { get; set; } = string.Empty;
    public string JungianPerspective { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

public class ShadowWorkDto
{
    public List<string> ShadowElements { get; set; } = new();
    public string ShadowInterpretation { get; set; } = string.Empty;
    public List<string> IntegrationQuestions { get; set; } = new();
    public string GuidanceMessage { get; set; } = string.Empty;
}

public class CreateInterpretationDto
{
    public int DreamId { get; set; }
    public bool IncludeShadowWork { get; set; } = true;
    public bool IncludePersonalHistory { get; set; } = true;
    public string? FocusArea { get; set; } // "relationships", "career", "spiritual", etc.
}

public class InterpretationThemeDto
{
    public string ThemeName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> CommonSymbols { get; set; } = new();
    public List<string> KeyQuestions { get; set; } = new();
    public string JungianContext { get; set; } = string.Empty;
}

public class PersonalSymbolPatternDto
{
    public string SymbolName { get; set; } = string.Empty;
    public int TotalOccurrences { get; set; }
    public DateTime FirstOccurrence { get; set; }
    public DateTime LastOccurrence { get; set; }
    public List<string> EvolutionNotes { get; set; } = new();
    public string PersonalMeaning { get; set; } = string.Empty;
    public List<string> CoOccurringSymbols { get; set; } = new();
}
