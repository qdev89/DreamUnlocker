using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DreamUnlocker.Api.Models;

public class DreamEmotion
{
    [Key]
    public int Id { get; set; }

    // Foreign keys
    [Required]
    public int DreamId { get; set; }

    [Required]
    public int EmotionId { get; set; }

    [Range(1, 10)]
    public int Intensity { get; set; } = 5;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("DreamId")]
    public virtual Dream Dream { get; set; } = null!;

    [ForeignKey("EmotionId")]
    public virtual Emotion Emotion { get; set; } = null!;
}
