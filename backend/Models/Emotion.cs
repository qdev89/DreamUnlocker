using System.ComponentModel.DataAnnotations;

namespace DreamUnlocker.Api.Models;

public class Emotion
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string Name { get; set; } = string.Empty;

    [StringLength(200)]
    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    // Navigation properties
    public virtual ICollection<DreamEmotion> DreamEmotions { get; set; } = new List<DreamEmotion>();
}
