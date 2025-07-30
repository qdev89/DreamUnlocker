using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using DreamUnlocker.Api.Models;

namespace DreamUnlocker.Api.Data;

public class DreamUnlockerDbContext : IdentityDbContext<User>
{
    public DreamUnlockerDbContext(DbContextOptions<DreamUnlockerDbContext> options) : base(options)
    {
    }

    public DbSet<Dream> Dreams { get; set; }
    public DbSet<Symbol> Symbols { get; set; }
    public DbSet<DreamSymbol> DreamSymbols { get; set; }
    public DbSet<Emotion> Emotions { get; set; }
    public DbSet<DreamEmotion> DreamEmotions { get; set; }
    public DbSet<DreamInterpretation> DreamInterpretations { get; set; }
    public DbSet<UserSymbolFrequency> UserSymbolFrequencies { get; set; }
    public DbSet<ExploratoryQuestion> ExploratoryQuestions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships and constraints
        modelBuilder.Entity<Dream>(entity =>
        {
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.DreamDate);
            entity.Property(e => e.Description).HasMaxLength(5000);
        });

        modelBuilder.Entity<DreamSymbol>(entity =>
        {
            entity.HasIndex(e => new { e.DreamId, e.SymbolId }).IsUnique();
        });

        modelBuilder.Entity<DreamEmotion>(entity =>
        {
            entity.HasIndex(e => new { e.DreamId, e.EmotionId }).IsUnique();
        });

        modelBuilder.Entity<UserSymbolFrequency>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.SymbolId }).IsUnique();
        });

        modelBuilder.Entity<Symbol>(entity =>
        {
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.ArchetypalMeaning).HasMaxLength(2000);
            entity.Property(e => e.PositiveAspect).HasMaxLength(1000);
            entity.Property(e => e.NegativeAspect).HasMaxLength(1000);
        });

        modelBuilder.Entity<DreamInterpretation>(entity =>
        {
            entity.HasIndex(e => e.DreamId).IsUnique();
            entity.Property(e => e.SymbolicAnalysis).HasMaxLength(3000);
            entity.Property(e => e.ExploratoryQuestions).HasMaxLength(2000);
            entity.Property(e => e.UserReflections).HasMaxLength(3000);
        });

        // Seed data for emotions
        SeedEmotions(modelBuilder);
    }

    private static void SeedEmotions(ModelBuilder modelBuilder)
    {
        var emotions = new[]
        {
            new Emotion { Id = 1, Name = "Joyful", Description = "Feeling happy and content", Category = "Positive" },
            new Emotion { Id = 2, Name = "Sad", Description = "Feeling sorrowful or melancholic", Category = "Negative" },
            new Emotion { Id = 3, Name = "Scared", Description = "Feeling afraid or frightened", Category = "Negative" },
            new Emotion { Id = 4, Name = "Anxious", Description = "Feeling worried or nervous", Category = "Negative" },
            new Emotion { Id = 5, Name = "Excited", Description = "Feeling enthusiastic and energetic", Category = "Positive" },
            new Emotion { Id = 6, Name = "Confused", Description = "Feeling uncertain or bewildered", Category = "Neutral" },
            new Emotion { Id = 7, Name = "Peaceful", Description = "Feeling calm and serene", Category = "Positive" },
            new Emotion { Id = 8, Name = "Angry", Description = "Feeling irritated or furious", Category = "Negative" },
            new Emotion { Id = 9, Name = "Curious", Description = "Feeling inquisitive and interested", Category = "Positive" },
            new Emotion { Id = 10, Name = "Nostalgic", Description = "Feeling sentimental about the past", Category = "Neutral" }
        };

        modelBuilder.Entity<Emotion>().HasData(emotions);
    }
}
