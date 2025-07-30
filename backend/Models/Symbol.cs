using System.ComponentModel.DataAnnotations;

namespace DreamUnlocker.Api.Models;

public class Symbol
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string ArchetypalMeaning { get; set; } = string.Empty;

    [Required]
    public string PositiveAspect { get; set; } = string.Empty;

    [Required]
    public string NegativeAspect { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<DreamSymbol> DreamSymbols { get; set; } = new List<DreamSymbol>();
    public virtual ICollection<UserSymbolFrequency> UserFrequencies { get; set; } = new List<UserSymbolFrequency>();
    public virtual ICollection<ExploratoryQuestion> Questions { get; set; } = new List<ExploratoryQuestion>();
}
