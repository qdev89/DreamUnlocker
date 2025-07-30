using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamUnlocker.Api.Models;

public class DreamInterpretation
{
    [Key]
    public int Id { get; set; }

    // Foreign key
    [Required]
    public int DreamId { get; set; }

    [Required]
    public string OverallTheme { get; set; } = string.Empty;

    [Required]
    public string PrimaryMessage { get; set; } = string.Empty;

    public string IntegrationSuggestion { get; set; } = string.Empty;

    public string? UserReflections { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    [ForeignKey("DreamId")]
    public virtual Dream Dream { get; set; } = null!;
}
