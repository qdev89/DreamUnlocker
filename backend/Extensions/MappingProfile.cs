using AutoMapper;
using DreamUnlocker.Api.Models;
using DreamUnlocker.Api.DTOs;

namespace DreamUnlocker.Api.Extensions;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, AuthResponseDto>()
            .ForMember(dest => dest.Token, opt => opt.Ignore())
            .ForMember(dest => dest.ExpiresAt, opt => opt.Ignore());

        // Dream mappings
        CreateMap<CreateDreamDto, Dream>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.Emotions, opt => opt.Ignore())
            .ForMember(dest => dest.Symbols, opt => opt.Ignore())
            .ForMember(dest => dest.Interpretation, opt => opt.Ignore());

        CreateMap<Dream, DreamDto>()
            .ForMember(dest => dest.Emotions, opt => opt.MapFrom(src => src.Emotions.Select(de => new EmotionDto
            {
                Id = de.Emotion.Id,
                Name = de.Emotion.Name,
                Description = de.Emotion.Description,
                Category = de.Emotion.Category,
                Intensity = de.Intensity
            })))
            .ForMember(dest => dest.Symbols, opt => opt.MapFrom(src => src.Symbols.Select(ds => new SymbolDto
            {
                Id = ds.Symbol.Id,
                Name = ds.Symbol.Name,
                ArchetypalMeaning = ds.Symbol.ArchetypalMeaning,
                PositiveAspect = ds.Symbol.PositiveAspect,
                NegativeAspect = ds.Symbol.NegativeAspect,
                Category = ds.Symbol.Category,
                UserContext = ds.UserContext
            })));

        CreateMap<Dream, DreamSummaryDto>()
            .ForMember(dest => dest.EmotionCount, opt => opt.MapFrom(src => src.Emotions.Count))
            .ForMember(dest => dest.SymbolCount, opt => opt.MapFrom(src => src.Symbols.Count))
            .ForMember(dest => dest.HasInterpretation, opt => opt.MapFrom(src => src.Interpretation != null));

        // Emotion mappings
        CreateMap<Emotion, EmotionDto>();

        // Symbol mappings
        CreateMap<Symbol, SymbolDto>()
            .ForMember(dest => dest.UserContext, opt => opt.Ignore());

        // Dream Interpretation mappings
        CreateMap<DreamInterpretation, DreamInterpretationDto>()
            .ForMember(dest => dest.SymbolInterpretations, opt => opt.Ignore())
            .ForMember(dest => dest.EmotionalInsights, opt => opt.Ignore())
            .ForMember(dest => dest.ExploratoryQuestions, opt => opt.Ignore())
            .ForMember(dest => dest.ShadowWork, opt => opt.Ignore());

        CreateMap<DreamInterpretationDto, DreamInterpretation>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Dream, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
    }
}
