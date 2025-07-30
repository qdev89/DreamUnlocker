using DreamUnlocker.Api.Models;

namespace DreamUnlocker.Api.Data;

public static class SymbolSeeder
{
    public static void SeedSymbols(DreamUnlockerDbContext context)
    {
        if (context.Symbols.Any())
            return; // Already seeded

        var symbols = new List<Symbol>
        {
            // Core Elements
            new Symbol
            {
                Name = "Water",
                ArchetypalMeaning = "In depth psychology, water is a primary symbol for the unconscious realm, the source of life and emotion. The clarity, movement (still vs. turbulent), and depth of the water offer important clues about the state of your emotions and psyche.",
                PositiveAspect = "Cleansing, renewal, emotional flow, spiritual baptism, life-giving force, intuitive wisdom, and connection to the feminine principle.",
                NegativeAspect = "Overwhelming emotions, drowning in the unconscious, emotional chaos, fear of the unknown depths, or being swept away by uncontrolled feelings.",
                Category = "Elements"
            },
            new Symbol
            {
                Name = "Snake",
                ArchetypalMeaning = "The snake is one of the most powerful archetypal symbols, representing the life force, transformation, and the connection between earth and spirit. It embodies both wisdom and danger, healing and poison.",
                PositiveAspect = "Transformation, shedding old skin, healing (as in the Rod of Asclepius), primal wisdom, kundalini energy, and spiritual awakening.",
                NegativeAspect = "Danger, temptation, betrayal, hidden threats, or an instinctual energy that feels threatening or overwhelming.",
                Category = "Animals"
            },
            new Symbol
            {
                Name = "House",
                ArchetypalMeaning = "A house often represents the dreamer's own self or psyche. Its rooms, corridors, and cellars can symbolize different aspects of your personality, memories, and potential. The condition and familiarity of the house reflect your relationship with yourself.",
                PositiveAspect = "Security, self-knowledge, personal growth, exploring new aspects of yourself, finding your true home within.",
                NegativeAspect = "Feeling trapped, hidden secrets, repressed memories, parts of yourself you're afraid to explore, or instability in your sense of self.",
                Category = "Structures"
            },
            new Symbol
            {
                Name = "Flying",
                ArchetypalMeaning = "Flying represents transcendence, freedom from earthly limitations, and the desire to rise above current circumstances. It often symbolizes spiritual aspiration and the liberation of consciousness.",
                PositiveAspect = "Freedom, transcendence, spiritual elevation, overcoming obstacles, gaining perspective, liberation from constraints.",
                NegativeAspect = "Escapism, fear of falling, disconnection from reality, avoiding earthly responsibilities, or anxiety about losing control.",
                Category = "Actions"
            },
            new Symbol
            {
                Name = "Death",
                ArchetypalMeaning = "Death in dreams rarely represents literal death but rather transformation, endings that make way for new beginnings, and the natural cycle of life. It symbolizes the death of old patterns, relationships, or aspects of self.",
                PositiveAspect = "Transformation, rebirth, letting go of what no longer serves, spiritual awakening, completion of a life phase.",
                NegativeAspect = "Fear of change, anxiety about loss, resistance to necessary endings, or feeling overwhelmed by life transitions.",
                Category = "Life Events"
            },
            new Symbol
            {
                Name = "Fire",
                ArchetypalMeaning = "Fire represents passion, transformation, purification, and the divine spark within. It can symbolize both creative energy and destructive force, illumination and consumption.",
                PositiveAspect = "Passion, creativity, purification, spiritual illumination, transformative energy, warmth, and life force.",
                NegativeAspect = "Destructive anger, consuming passion, being burned by emotions, loss of control, or fear of your own power.",
                Category = "Elements"
            },
            new Symbol
            {
                Name = "Forest",
                ArchetypalMeaning = "The forest represents the unconscious mind, the unknown, and the place of transformation. It's where fairy tale heroes face their trials and where we encounter both wisdom and danger.",
                PositiveAspect = "Natural wisdom, growth, connection to nature, spiritual journey, finding your path, inner resources.",
                NegativeAspect = "Being lost, confusion, hidden dangers, fear of the unknown, feeling overwhelmed by the unconscious.",
                Category = "Nature"
            },
            new Symbol
            {
                Name = "Mirror",
                ArchetypalMeaning = "Mirrors symbolize self-reflection, truth, and the confrontation with one's true nature. They can reveal both the conscious self and the hidden shadow aspects of personality.",
                PositiveAspect = "Self-awareness, truth, clarity, honest self-examination, seeing yourself clearly, wisdom.",
                NegativeAspect = "Vanity, self-deception, fear of seeing your true self, confronting unwanted aspects of personality, or distorted self-image.",
                Category = "Objects"
            },
            new Symbol
            {
                Name = "Bridge",
                ArchetypalMeaning = "Bridges represent transition, connection between different states of being, and the passage from one phase of life to another. They symbolize the link between conscious and unconscious, known and unknown.",
                PositiveAspect = "Transition, connection, overcoming obstacles, linking different aspects of life, progress, moving forward.",
                NegativeAspect = "Fear of change, anxiety about crossing into unknown territory, feeling stuck between two worlds, or fear of commitment to a new path.",
                Category = "Structures"
            },
            new Symbol
            {
                Name = "Child",
                ArchetypalMeaning = "The child represents innocence, new beginnings, potential, and the authentic self. It can symbolize both vulnerability and the pure, unconditioned aspects of your nature.",
                PositiveAspect = "Innocence, new beginnings, potential, authenticity, wonder, spontaneity, and connection to your true nature.",
                NegativeAspect = "Vulnerability, helplessness, immaturity, fear of responsibility, or regression to earlier developmental stages.",
                Category = "People"
            },

            // Additional Core Symbols
            new Symbol
            {
                Name = "Tree",
                ArchetypalMeaning = "The tree is a powerful symbol of growth, connection between earth and sky, and the axis mundi - the center of the world. It represents the self's development through time and the connection between conscious and unconscious realms.",
                PositiveAspect = "Growth, stability, wisdom, connection to nature, spiritual grounding, life force, and the integration of different levels of being.",
                NegativeAspect = "Being stuck, rigid thinking, inability to adapt, or feeling rooted in unhealthy patterns.",
                Category = "Nature"
            },
            new Symbol
            {
                Name = "Mountain",
                ArchetypalMeaning = "Mountains represent spiritual aspiration, the journey toward higher consciousness, and the challenges that must be overcome to reach enlightenment. They symbolize both the goal and the obstacles on the path.",
                PositiveAspect = "Spiritual aspiration, achievement, perspective, stability, connection to the divine, and overcoming challenges.",
                NegativeAspect = "Insurmountable obstacles, isolation, cold detachment, or the burden of high expectations.",
                Category = "Nature"
            },
            new Symbol
            {
                Name = "Sun",
                ArchetypalMeaning = "The sun represents consciousness, enlightenment, the masculine principle, and the ego. It symbolizes clarity, truth, and the illuminating power of awareness.",
                PositiveAspect = "Consciousness, enlightenment, vitality, truth, clarity, masculine energy, and life-giving power.",
                NegativeAspect = "Ego inflation, harsh judgment, burning out, excessive rationality, or blinding pride.",
                Category = "Celestial"
            },
            new Symbol
            {
                Name = "Moon",
                ArchetypalMeaning = "The moon represents the feminine principle, intuition, cycles, and the mysterious aspects of the psyche. It governs emotions, dreams, and the hidden realms of consciousness.",
                PositiveAspect = "Intuition, feminine wisdom, emotional depth, cycles of renewal, mystery, and connection to the unconscious.",
                NegativeAspect = "Emotional instability, illusion, deception, moodiness, or being lost in fantasy.",
                Category = "Celestial"
            },
            new Symbol
            {
                Name = "Cave",
                ArchetypalMeaning = "The cave represents the womb, the unconscious mind, and the place of inner transformation. It's where one goes to face the shadow and emerge reborn.",
                PositiveAspect = "Inner wisdom, spiritual retreat, transformation, protection, and connection to the earth mother.",
                NegativeAspect = "Isolation, depression, being trapped in the unconscious, or fear of inner exploration.",
                Category = "Structures"
            },
            new Symbol
            {
                Name = "Bird",
                ArchetypalMeaning = "Birds represent the soul, spiritual messengers, and the connection between earth and heaven. They symbolize freedom, transcendence, and the ability to see from higher perspectives.",
                PositiveAspect = "Freedom, spiritual messages, transcendence, perspective, communication with the divine, and liberation.",
                NegativeAspect = "Escapism, flightiness, inability to ground, or messages of warning and doom.",
                Category = "Animals"
            },
            new Symbol
            {
                Name = "Wolf",
                ArchetypalMeaning = "The wolf represents the wild, instinctual nature, loyalty, and the shadow aspects of the psyche. It can symbolize both the teacher and the threat from the unconscious.",
                PositiveAspect = "Instinctual wisdom, loyalty, protection, teaching, and connection to wild nature.",
                NegativeAspect = "Destructive instincts, predatory behavior, pack mentality, or being consumed by shadow impulses.",
                Category = "Animals"
            },
            new Symbol
            {
                Name = "Door",
                ArchetypalMeaning = "Doors represent opportunities, transitions, and the threshold between different states of consciousness. They symbolize choice and the passage from one phase of life to another.",
                PositiveAspect = "New opportunities, transitions, choices, opening to new experiences, and spiritual passages.",
                NegativeAspect = "Closed opportunities, fear of change, being locked out, or anxiety about unknown territories.",
                Category = "Structures"
            },
            new Symbol
            {
                Name = "Key",
                ArchetypalMeaning = "Keys represent knowledge, secrets, access to hidden realms, and the power to unlock mysteries. They symbolize the tools needed for spiritual and psychological development.",
                PositiveAspect = "Knowledge, access to wisdom, unlocking potential, secrets revealed, and spiritual tools.",
                NegativeAspect = "Forbidden knowledge, being locked out, lost opportunities, or the burden of secrets.",
                Category = "Objects"
            },
            new Symbol
            {
                Name = "Sword",
                ArchetypalMeaning = "The sword represents discrimination, the power of the mind to cut through illusion, and the masculine principle of action. It symbolizes both protection and the potential for destruction.",
                PositiveAspect = "Clarity, discrimination, protection, justice, cutting through illusion, and spiritual warfare against negativity.",
                NegativeAspect = "Aggression, violence, harsh judgment, cutting words, or the destructive use of power.",
                Category = "Objects"
            },
            new Symbol
            {
                Name = "Crown",
                ArchetypalMeaning = "The crown represents authority, spiritual achievement, and the realization of one's highest potential. It symbolizes both earthly power and divine connection.",
                PositiveAspect = "Authority, achievement, spiritual realization, leadership, and connection to higher purpose.",
                NegativeAspect = "Ego inflation, abuse of power, false authority, or the burden of responsibility.",
                Category = "Objects"
            }
        };

        context.Symbols.AddRange(symbols);
        context.SaveChanges();
    }
}
