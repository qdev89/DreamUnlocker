using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DreamUnlocker.Api.DTOs;
using DreamUnlocker.Api.Services;
using System.Security.Claims;

namespace DreamUnlocker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    /// <summary>
    /// Get comprehensive analytics for the current user
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<ActionResult<UserAnalyticsDto>> GetDashboard()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var analytics = await _analyticsService.GetUserAnalyticsAsync(userId);
        return Ok(analytics);
    }

    /// <summary>
    /// Get top symbols by frequency for the current user
    /// </summary>
    [HttpGet("symbols/top")]
    public async Task<ActionResult<IEnumerable<SymbolFrequencyDto>>> GetTopSymbols([FromQuery] int count = 10)
    {
        if (count < 1 || count > 50) count = 10;

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var symbols = await _analyticsService.GetTopSymbolsAsync(userId, count);
        return Ok(symbols);
    }

    /// <summary>
    /// Get top emotions by frequency for the current user
    /// </summary>
    [HttpGet("emotions/top")]
    public async Task<ActionResult<IEnumerable<EmotionFrequencyDto>>> GetTopEmotions([FromQuery] int count = 10)
    {
        if (count < 1 || count > 50) count = 10;

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var emotions = await _analyticsService.GetTopEmotionsAsync(userId, count);
        return Ok(emotions);
    }

    /// <summary>
    /// Get dream patterns and correlations for the current user
    /// </summary>
    [HttpGet("patterns")]
    public async Task<ActionResult<DreamPatternsDto>> GetDreamPatterns()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var patterns = await _analyticsService.GetDreamPatternsAsync(userId);
        return Ok(patterns);
    }

    /// <summary>
    /// Get dream activity over time for the current user
    /// </summary>
    [HttpGet("activity")]
    public async Task<ActionResult<IEnumerable<DreamActivityDto>>> GetDreamActivity([FromQuery] int days = 30)
    {
        if (days < 1 || days > 365) days = 30;

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var activity = await _analyticsService.GetDreamActivityAsync(userId, days);
        return Ok(activity);
    }
}
