using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace DreamUnlocker.Api.Models;

public class User : IdentityUser
{
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public virtual ICollection<Dream> Dreams { get; set; } = new List<Dream>();
    public virtual ICollection<UserSymbolFrequency> SymbolFrequencies { get; set; } = new List<UserSymbolFrequency>();
}
