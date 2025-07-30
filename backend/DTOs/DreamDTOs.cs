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
    public int Id { get; set; }
    public string SymbolicAnalysis { get; set; } = string.Empty;
    public List<string> ExploratoryQuestions { get; set; } = new();
    public string? UserReflections { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
