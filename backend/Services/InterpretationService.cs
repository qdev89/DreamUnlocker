using Microsoft.EntityFrameworkCore;
using DreamUnlocker.Api.Data;
using DreamUnlocker.Api.DTOs;
using DreamUnlocker.Api.Models;

namespace DreamUnlocker.Api.Services;

public class InterpretationService : IInterpretationService
{
    private readonly DreamUnlockerDbContext _context;

    public InterpretationService(DreamUnlockerDbContext context)
    {
        _context = context;
    }

    public async Task<DreamInterpretationDto> GenerateInterpretationAsync(string userId, CreateInterpretationDto request)
    {
        var dream = await _context.Dreams
            .Include(d => d.Symbols).ThenInclude(ds => ds.Symbol)
            .Include(d => d.Emotions).ThenInclude(de => de.Emotion)
            .Include(d => d.Interpretation)
            .FirstOrDefaultAsync(d => d.Id == request.DreamId && d.UserId == userId);

        if (dream == null)
            throw new ArgumentException("Dream not found");

        // Check if interpretation already exists
        if (dream.Interpretation != null)
        {
            return await MapInterpretationToDto(dream.Interpretation, userId);
        }

        // Generate new interpretation
        var symbolInterpretations = await GenerateSymbolInterpretationsAsync(userId, dream.Symbols.ToList());
        var emotionalInsights = await GenerateEmotionalInsightsAsync(dream.Emotions.ToList());
        var overallTheme = await DetermineOverallThemeAsync(symbolInterpretations, emotionalInsights);
        var primaryMessage = await GeneratePrimaryMessageAsync(overallTheme, symbolInterpretations);
        var exploratoryQuestions = await GenerateExploratoryQuestionsAsync(userId, request.DreamId);
        var shadowWork = request.IncludeShadowWork ? await GenerateShadowWorkAsync(userId, request.DreamId) : new ShadowWorkDto();
        var integrationSuggestion = await GenerateIntegrationSuggestionAsync(overallTheme, symbolInterpretations, emotionalInsights);

        // Save interpretation to database
        var interpretation = new DreamInterpretation
        {
            DreamId = request.DreamId,
            OverallTheme = overallTheme,
            PrimaryMessage = primaryMessage,
            IntegrationSuggestion = integrationSuggestion,
            CreatedAt = DateTime.UtcNow
        };

        _context.DreamInterpretations.Add(interpretation);
        await _context.SaveChangesAsync();

        return new DreamInterpretationDto
        {
            DreamId = request.DreamId,
            OverallTheme = overallTheme,
            PrimaryMessage = primaryMessage,
            SymbolInterpretations = symbolInterpretations,
            EmotionalInsights = emotionalInsights,
            ExploratoryQuestions = exploratoryQuestions.ToList(),
            ShadowWork = shadowWork,
            IntegrationSuggestion = integrationSuggestion,
            CreatedAt = interpretation.CreatedAt
        };
    }

    public async Task<DreamInterpretationDto?> GetInterpretationAsync(string userId, int dreamId)
    {
        var interpretation = await _context.DreamInterpretations
            .Include(i => i.Dream)
            .FirstOrDefaultAsync(i => i.DreamId == dreamId && i.Dream.UserId == userId);

        if (interpretation == null)
            return null;

        return await MapInterpretationToDto(interpretation, userId);
    }

    public async Task<IEnumerable<InterpretationThemeDto>> GetCommonThemesAsync()
    {
        // Return predefined Jungian themes
        return new List<InterpretationThemeDto>
        {
            new InterpretationThemeDto
            {
                ThemeName = "The Hero's Journey",
                Description = "Dreams of adventure, challenges, and transformation representing personal growth and individuation.",
                CommonSymbols = new List<string> { "Mountain", "Bridge", "Sword", "Crown", "Forest" },
                KeyQuestions = new List<string> 
                { 
                    "What challenge are you currently facing in your life?",
                    "What qualities do you need to develop to overcome this challenge?",
                    "How might this dream be calling you to grow?"
                },
                JungianContext = "The hero's journey represents the individuation process - the psychological journey toward wholeness and self-realization."
            },
            new InterpretationThemeDto
            {
                ThemeName = "Shadow Integration",
                Description = "Dreams featuring dark figures, hidden rooms, or threatening elements that represent rejected aspects of the self.",
                CommonSymbols = new List<string> { "Cave", "Snake", "Wolf", "Mirror", "Death" },
                KeyQuestions = new List<string>
                {
                    "What aspects of yourself do you tend to reject or deny?",
                    "How might these 'negative' qualities actually serve you if integrated consciously?",
                    "What is this shadow figure trying to teach you?"
                },
                JungianContext = "Shadow work involves recognizing and integrating the rejected aspects of our personality to achieve psychological wholeness."
            },
            new InterpretationThemeDto
            {
                ThemeName = "Anima/Animus Encounter",
                Description = "Dreams featuring significant opposite-gender figures representing the contrasexual aspect of the psyche.",
                CommonSymbols = new List<string> { "Water", "Moon", "Sun", "Mirror", "Child" },
                KeyQuestions = new List<string>
                {
                    "What qualities does this figure embody that you might need to develop?",
                    "How do you relate to the feminine/masculine aspects within yourself?",
                    "What is this figure asking of you?"
                },
                JungianContext = "The anima (feminine in men) and animus (masculine in women) represent the contrasexual aspects that need integration for psychological balance."
            }
        };
    }

    public async Task<IEnumerable<PersonalSymbolPatternDto>> GetPersonalSymbolPatternsAsync(string userId)
    {
        var symbolFrequencies = await _context.UserSymbolFrequencies
            .Include(f => f.Symbol)
            .Where(f => f.UserId == userId && f.Frequency > 1)
            .OrderByDescending(f => f.Frequency)
            .ToListAsync();

        var patterns = new List<PersonalSymbolPatternDto>();

        foreach (var frequency in symbolFrequencies)
        {
            var coOccurringSymbols = await GetCoOccurringSymbolsAsync(userId, frequency.SymbolId);
            
            patterns.Add(new PersonalSymbolPatternDto
            {
                SymbolName = frequency.Symbol.Name,
                TotalOccurrences = frequency.Frequency,
                FirstOccurrence = frequency.LastOccurrence.AddDays(-30), // Simplified - would track actual first occurrence
                LastOccurrence = frequency.LastOccurrence,
                PersonalMeaning = await GeneratePersonalMeaningAsync(userId, frequency.Symbol),
                CoOccurringSymbols = coOccurringSymbols.ToList(),
                EvolutionNotes = new List<string> { "Pattern analysis requires more dream entries for detailed evolution tracking." }
            });
        }

        return patterns;
    }

    public async Task<IEnumerable<string>> GenerateExploratoryQuestionsAsync(string userId, int dreamId)
    {
        var dream = await _context.Dreams
            .Include(d => d.Symbols).ThenInclude(ds => ds.Symbol)
            .Include(d => d.Emotions).ThenInclude(de => de.Emotion)
            .FirstOrDefaultAsync(d => d.Id == dreamId && d.UserId == userId);

        if (dream == null)
            return new List<string>();

        var questions = new List<string>
        {
            "What emotions did you experience most strongly in this dream?",
            "Which symbol or image from the dream feels most significant to you?",
            "How do the themes in this dream relate to your current life situation?"
        };

        // Add symbol-specific questions
        foreach (var dreamSymbol in dream.Symbols)
        {
            questions.AddRange(GetSymbolSpecificQuestions(dreamSymbol.Symbol.Name));
        }

        // Add emotion-specific questions
        foreach (var dreamEmotion in dream.Emotions)
        {
            questions.Add($"What in your waking life might be connected to the {dreamEmotion.Emotion.Name.ToLower()} you felt in this dream?");
        }

        return questions.Take(8).ToList(); // Limit to 8 questions
    }

    public async Task<ShadowWorkDto> GenerateShadowWorkAsync(string userId, int dreamId)
    {
        var dream = await _context.Dreams
            .Include(d => d.Symbols).ThenInclude(ds => ds.Symbol)
            .Include(d => d.Emotions).ThenInclude(de => de.Emotion)
            .FirstOrDefaultAsync(d => d.Id == dreamId && d.UserId == userId);

        if (dream == null)
            return new ShadowWorkDto();

        var shadowElements = new List<string>();
        var integrationQuestions = new List<string>();

        // Identify potential shadow elements
        foreach (var dreamSymbol in dream.Symbols)
        {
            var shadowAspect = GetShadowAspect(dreamSymbol.Symbol.Name);
            if (!string.IsNullOrEmpty(shadowAspect))
            {
                shadowElements.Add($"{dreamSymbol.Symbol.Name}: {shadowAspect}");
            }
        }

        // Add shadow-specific questions
        integrationQuestions.AddRange(new List<string>
        {
            "What aspects of this dream make you uncomfortable or resistant?",
            "How might the challenging elements in this dream reflect parts of yourself you tend to avoid?",
            "What would happen if you embraced rather than rejected these shadow aspects?",
            "How could integrating these qualities serve your growth and wholeness?"
        });

        var shadowInterpretation = shadowElements.Any() 
            ? "This dream presents opportunities to explore and integrate rejected aspects of your psyche. The shadow elements invite you to examine what you might be avoiding or denying about yourself."
            : "This dream appears to focus more on conscious development rather than shadow integration at this time.";

        return new ShadowWorkDto
        {
            ShadowElements = shadowElements,
            ShadowInterpretation = shadowInterpretation,
            IntegrationQuestions = integrationQuestions,
            GuidanceMessage = "Remember that shadow work is about integration, not elimination. These aspects of yourself, when consciously acknowledged, can become sources of strength and authenticity."
        };
    }

    // Helper methods would continue here...
    private async Task<List<SymbolInterpretationDto>> GenerateSymbolInterpretationsAsync(string userId, List<DreamSymbol> dreamSymbols)
    {
        var interpretations = new List<SymbolInterpretationDto>();

        foreach (var dreamSymbol in dreamSymbols)
        {
            var userFrequency = await _context.UserSymbolFrequencies
                .Where(f => f.UserId == userId && f.SymbolId == dreamSymbol.SymbolId)
                .Select(f => f.Frequency)
                .FirstOrDefaultAsync();

            var relatedSymbols = await GetRelatedSymbolsAsync(dreamSymbol.SymbolId);

            interpretations.Add(new SymbolInterpretationDto
            {
                SymbolId = dreamSymbol.SymbolId,
                SymbolName = dreamSymbol.Symbol.Name,
                ArchetypalMeaning = dreamSymbol.Symbol.ArchetypalMeaning,
                PersonalizedInterpretation = await GeneratePersonalizedInterpretationAsync(userId, dreamSymbol.Symbol),
                LightAspect = dreamSymbol.Symbol.PositiveAspect,
                ShadowAspect = dreamSymbol.Symbol.NegativeAspect,
                Category = dreamSymbol.Symbol.Category,
                UserFrequency = userFrequency,
                RelatedSymbols = relatedSymbols.ToList()
            });
        }

        return interpretations;
    }

    private async Task<List<EmotionalInsightDto>> GenerateEmotionalInsightsAsync(List<DreamEmotion> dreamEmotions)
    {
        var insights = new List<EmotionalInsightDto>();

        foreach (var dreamEmotion in dreamEmotions)
        {
            insights.Add(new EmotionalInsightDto
            {
                EmotionName = dreamEmotion.Emotion.Name,
                Intensity = dreamEmotion.Intensity,
                Insight = GenerateEmotionalInsight(dreamEmotion.Emotion.Name, dreamEmotion.Intensity),
                JungianPerspective = GetJungianEmotionalPerspective(dreamEmotion.Emotion.Name),
                Category = dreamEmotion.Emotion.Category
            });
        }

        return insights;
    }

    // Additional helper methods would be implemented here...
    private async Task<string> DetermineOverallThemeAsync(List<SymbolInterpretationDto> symbols, List<EmotionalInsightDto> emotions)
    {
        // Simplified theme determination logic
        if (symbols.Any(s => s.Category == "Nature" || s.SymbolName == "Water" || s.SymbolName == "Tree"))
            return "Connection and Growth";
        if (symbols.Any(s => s.SymbolName == "Death" || s.SymbolName == "Snake"))
            return "Transformation and Renewal";
        if (symbols.Any(s => s.SymbolName == "House" || s.SymbolName == "Mirror"))
            return "Self-Discovery and Inner Exploration";
        
        return "Personal Development and Awareness";
    }

    private async Task<string> GeneratePrimaryMessageAsync(string theme, List<SymbolInterpretationDto> symbols)
    {
        return $"This dream appears to be guiding you toward {theme.ToLower()}. The symbols present suggest a time of inner work and conscious development.";
    }

    private async Task<string> GenerateIntegrationSuggestionAsync(string theme, List<SymbolInterpretationDto> symbols, List<EmotionalInsightDto> emotions)
    {
        return "Consider journaling about the emotions and symbols that felt most significant. Pay attention to how these themes might be manifesting in your daily life.";
    }

    private async Task<DreamInterpretationDto> MapInterpretationToDto(DreamInterpretation interpretation, string userId)
    {
        // This would map the stored interpretation back to DTO format
        // For now, return a simplified version
        return new DreamInterpretationDto
        {
            DreamId = interpretation.DreamId,
            OverallTheme = interpretation.OverallTheme,
            PrimaryMessage = interpretation.PrimaryMessage,
            IntegrationSuggestion = interpretation.IntegrationSuggestion,
            CreatedAt = interpretation.CreatedAt,
            SymbolInterpretations = new List<SymbolInterpretationDto>(),
            EmotionalInsights = new List<EmotionalInsightDto>(),
            ExploratoryQuestions = new List<string>(),
            ShadowWork = new ShadowWorkDto()
        };
    }

    private async Task<IEnumerable<string>> GetCoOccurringSymbolsAsync(string userId, int symbolId)
    {
        // Find symbols that appear with this symbol in the same dreams
        return await _context.DreamSymbols
            .Where(ds => ds.Dream.UserId == userId && 
                        ds.Dream.Symbols.Any(s => s.SymbolId == symbolId) && 
                        ds.SymbolId != symbolId)
            .Select(ds => ds.Symbol.Name)
            .Distinct()
            .Take(5)
            .ToListAsync();
    }

    private async Task<string> GeneratePersonalMeaningAsync(string userId, Symbol symbol)
    {
        return $"Based on your recurring dreams, {symbol.Name} appears to represent personal themes of growth and self-discovery in your psyche.";
    }

    private async Task<string> GeneratePersonalizedInterpretationAsync(string userId, Symbol symbol)
    {
        return $"In your personal dream context, {symbol.Name} may be highlighting themes related to {symbol.Category.ToLower()} and personal development.";
    }

    private async Task<IEnumerable<string>> GetRelatedSymbolsAsync(int symbolId)
    {
        var symbol = await _context.Symbols.FindAsync(symbolId);
        if (symbol == null) return new List<string>();

        // Return symbols from the same category
        return await _context.Symbols
            .Where(s => s.Category == symbol.Category && s.Id != symbolId)
            .Select(s => s.Name)
            .Take(3)
            .ToListAsync();
    }

    private List<string> GetSymbolSpecificQuestions(string symbolName)
    {
        return symbolName.ToLower() switch
        {
            "water" => new List<string> { "How do you currently relate to your emotions and intuitive side?" },
            "house" => new List<string> { "What aspects of yourself are you exploring or need to explore?" },
            "snake" => new List<string> { "What transformation is calling to you in your life right now?" },
            "fire" => new List<string> { "Where do you need more passion or creative energy in your life?" },
            _ => new List<string>()
        };
    }

    private string GetShadowAspect(string symbolName)
    {
        return symbolName.ToLower() switch
        {
            "water" => "Overwhelming emotions or emotional chaos",
            "snake" => "Hidden threats or dangerous transformations",
            "fire" => "Destructive anger or consuming passion",
            "wolf" => "Predatory instincts or pack mentality",
            _ => ""
        };
    }

    private string GenerateEmotionalInsight(string emotionName, int intensity)
    {
        var intensityDesc = intensity switch
        {
            <= 3 => "mild",
            <= 6 => "moderate", 
            <= 8 => "strong",
            _ => "intense"
        };

        return $"The {intensityDesc} {emotionName.ToLower()} in this dream may reflect similar feelings in your waking life that deserve attention.";
    }

    private string GetJungianEmotionalPerspective(string emotionName)
    {
        return emotionName.ToLower() switch
        {
            "fear" => "Fear in dreams often points to aspects of growth or change that the ego resists.",
            "joy" => "Joy represents alignment with your authentic self and life purpose.",
            "anger" => "Anger may indicate boundaries that need to be set or energy that needs direction.",
            "sadness" => "Sadness can represent necessary grieving or letting go of what no longer serves.",
            _ => "This emotion carries important information about your inner state and development."
        };
    }
}
