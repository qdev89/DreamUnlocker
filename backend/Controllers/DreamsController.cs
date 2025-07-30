using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DreamUnlocker.Api.DTOs;
using DreamUnlocker.Api.Services;
using System.Security.Claims;

namespace DreamUnlocker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DreamsController : ControllerBase
{
    private readonly IDreamService _dreamService;

    public DreamsController(IDreamService dreamService)
    {
        _dreamService = dreamService;
    }

    /// <summary>
    /// Create a new dream entry
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<DreamDto>> CreateDream(CreateDreamDto createDreamDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        try
        {
            var dream = await _dreamService.CreateDreamAsync(userId, createDreamDto);
            return CreatedAtAction(nameof(GetDream), new { id = dream.Id }, dream);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the dream.", error = ex.Message });
        }
    }

    /// <summary>
    /// Get a specific dream by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<DreamDto>> GetDream(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var dream = await _dreamService.GetDreamByIdAsync(userId, id);
        if (dream == null)
            return NotFound();

        return Ok(dream);
    }

    /// <summary>
    /// Get all dreams for the current user with pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DreamSummaryDto>>> GetUserDreams(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 50) pageSize = 10;

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var dreams = await _dreamService.GetUserDreamsAsync(userId, page, pageSize);
        return Ok(dreams);
    }

    /// <summary>
    /// Update an existing dream
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<DreamDto>> UpdateDream(int id, UpdateDreamDto updateDreamDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var dream = await _dreamService.UpdateDreamAsync(userId, id, updateDreamDto);
        if (dream == null)
            return NotFound();

        return Ok(dream);
    }

    /// <summary>
    /// Delete a dream
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDream(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var success = await _dreamService.DeleteDreamAsync(userId, id);
        if (!success)
            return NotFound();

        return NoContent();
    }

    /// <summary>
    /// Search for symbols by name
    /// </summary>
    [HttpGet("symbols/search")]
    public async Task<ActionResult<IEnumerable<SymbolDto>>> SearchSymbols([FromQuery] string term)
    {
        if (string.IsNullOrWhiteSpace(term) || term.Length < 2)
            return BadRequest("Search term must be at least 2 characters long.");

        var symbols = await _dreamService.SearchSymbolsAsync(term);
        return Ok(symbols);
    }

    /// <summary>
    /// Get all available emotions
    /// </summary>
    [HttpGet("emotions")]
    public async Task<ActionResult<IEnumerable<EmotionDto>>> GetEmotions()
    {
        var emotions = await _dreamService.GetAllEmotionsAsync();
        return Ok(emotions);
    }
}
