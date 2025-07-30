using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamUnlocker.Api.Models;

public class ExploratoryQuestion
{
    [Key]
    public int Id { get; set; }

    // Foreign key
    [Required]
    public int SymbolId { get; set; }

    [Required]
    public string Question { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;
    public int Priority { get; set; } = 1;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("SymbolId")]
    public virtual Symbol Symbol { get; set; } = null!;
}
