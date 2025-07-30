using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamUnlocker.Api.Models;

public class UserSymbolFrequency
{
    [Key]
    public int Id { get; set; }

    // Foreign keys
    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public int SymbolId { get; set; }

    [Required]
    public int Frequency { get; set; } = 1;

    public DateTime LastOccurrence { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    [ForeignKey("SymbolId")]
    public virtual Symbol Symbol { get; set; } = null!;
}
