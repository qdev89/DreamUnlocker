using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DreamUnlocker.Api.DTOs;
using DreamUnlocker.Api.Services;
using System.Security.Claims;

namespace DreamUnlocker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InterpretationController : ControllerBase
{
    private readonly IInterpretationService _interpretationService;

    public InterpretationController(IInterpretationService interpretationService)
    {
        _interpretationService = interpretationService;
    }

    /// <summary>
    /// Generate a Jungian interpretation for a dream
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<DreamInterpretationDto>> GenerateInterpretation(CreateInterpretationDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        try
        {
            var interpretation = await _interpretationService.GenerateInterpretationAsync(userId, request);
            return Ok(interpretation);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while generating the interpretation.", error = ex.Message });
        }
    }

    /// <summary>
    /// Get existing interpretation for a dream
    /// </summary>
    [HttpGet("dream/{dreamId}")]
    public async Task<ActionResult<DreamInterpretationDto>> GetInterpretation(int dreamId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var interpretation = await _interpretationService.GetInterpretationAsync(userId, dreamId);
        if (interpretation == null)
            return NotFound();

        return Ok(interpretation);
    }

    /// <summary>
    /// Get common Jungian dream themes
    /// </summary>
    [HttpGet("themes")]
    public async Task<ActionResult<IEnumerable<InterpretationThemeDto>>> GetCommonThemes()
    {
        var themes = await _interpretationService.GetCommonThemesAsync();
        return Ok(themes);
    }

    /// <summary>
    /// Get personal symbol patterns for the current user
    /// </summary>
    [HttpGet("patterns/personal")]
    public async Task<ActionResult<IEnumerable<PersonalSymbolPatternDto>>> GetPersonalSymbolPatterns()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var patterns = await _interpretationService.GetPersonalSymbolPatternsAsync(userId);
        return Ok(patterns);
    }

    /// <summary>
    /// Generate exploratory questions for a dream
    /// </summary>
    [HttpGet("questions/{dreamId}")]
    public async Task<ActionResult<IEnumerable<string>>> GetExploratoryQuestions(int dreamId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var questions = await _interpretationService.GenerateExploratoryQuestionsAsync(userId, dreamId);
        return Ok(questions);
    }

    /// <summary>
    /// Generate shadow work analysis for a dream
    /// </summary>
    [HttpGet("shadow/{dreamId}")]
    public async Task<ActionResult<ShadowWorkDto>> GetShadowWork(int dreamId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var shadowWork = await _interpretationService.GenerateShadowWorkAsync(userId, dreamId);
        return Ok(shadowWork);
    }
}
