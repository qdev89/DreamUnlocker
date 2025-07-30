using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamUnlocker.Api.Models;

public class DreamSymbol
{
    [Key]
    public int Id { get; set; }

    // Foreign keys
    [Required]
    public int DreamId { get; set; }

    [Required]
    public int SymbolId { get; set; }

    public string? UserContext { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("DreamId")]
    public virtual Dream Dream { get; set; } = null!;

    [ForeignKey("SymbolId")]
    public virtual Symbol Symbol { get; set; } = null!;
}
