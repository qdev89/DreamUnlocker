using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamUnlocker.Api.Models;

public class Dream
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime DreamDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Foreign key
    [Required]
    public string UserId { get; set; } = string.Empty;

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
    
    public virtual ICollection<DreamEmotion> Emotions { get; set; } = new List<DreamEmotion>();
    public virtual ICollection<DreamSymbol> Symbols { get; set; } = new List<DreamSymbol>();
    public virtual DreamInterpretation? Interpretation { get; set; }
}
