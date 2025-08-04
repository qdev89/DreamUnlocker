import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Complete symbol data from the backend seeder
const symbolsData = [
  {
    name: "Water",
    archetypalMeaning: "In depth psychology, water is a primary symbol for the unconscious realm, the source of life and emotion. The clarity, movement (still vs. turbulent), and depth of the water offer important clues about the state of your emotions and psyche.",
    positiveAspect: "Cleansing, renewal, emotional flow, spiritual baptism, life-giving force, intuitive wisdom, and connection to the feminine principle.",
    negativeAspect: "Overwhelming emotions, drowning in the unconscious, emotional chaos, fear of the unknown depths, or being swept away by uncontrolled feelings.",
    category: "Elements"
  },
  {
    name: "Snake",
    archetypalMeaning: "The snake is one of the most powerful archetypal symbols, representing the life force, transformation, and the connection between earth and spirit. It embodies both wisdom and danger, healing and poison.",
    positiveAspect: "Transformation, shedding old skin, healing (as in the Rod of Asclepius), primal wisdom, kundalini energy, and spiritual awakening.",
    negativeAspect: "Danger, temptation, betrayal, hidden threats, or an instinctual energy that feels threatening or overwhelming.",
    category: "Animals"
  },
  {
    name: "House",
    archetypalMeaning: "A house often represents the dreamer's own self or psyche. Its rooms, corridors, and cellars can symbolize different aspects of your personality, memories, and potential. The condition and familiarity of the house reflect your relationship with yourself.",
    positiveAspect: "Security, self-knowledge, personal growth, exploring new aspects of yourself, finding your true home within.",
    negativeAspect: "Feeling trapped, hidden secrets, repressed memories, parts of yourself you're afraid to explore, or instability in your sense of self.",
    category: "Structures"
  },
  {
    name: "Flying",
    archetypalMeaning: "Flying represents transcendence, freedom from earthly limitations, and the desire to rise above current circumstances. It often symbolizes spiritual aspiration and the liberation of consciousness.",
    positiveAspect: "Freedom, transcendence, spiritual elevation, overcoming obstacles, gaining perspective, liberation from constraints.",
    negativeAspect: "Escapism, fear of falling, disconnection from reality, avoiding earthly responsibilities, or anxiety about losing control.",
    category: "Actions"
  },
  {
    name: "Death",
    archetypalMeaning: "Death in dreams rarely represents literal death but rather transformation, endings that make way for new beginnings, and the natural cycle of life. It symbolizes the death of old patterns, relationships, or aspects of self.",
    positiveAspect: "Transformation, rebirth, letting go of what no longer serves, spiritual awakening, completion of a life phase.",
    negativeAspect: "Fear of change, anxiety about loss, resistance to necessary endings, or feeling overwhelmed by life transitions.",
    category: "Life Events"
  },
  {
    name: "Fire",
    archetypalMeaning: "Fire represents passion, transformation, purification, and the divine spark within. It can symbolize both creative energy and destructive force, illumination and consumption.",
    positiveAspect: "Passion, creativity, purification, spiritual illumination, transformative energy, warmth, and life force.",
    negativeAspect: "Destructive anger, consuming passion, being burned by emotions, loss of control, or fear of your own power.",
    category: "Elements"
  },
  {
    name: "Forest",
    archetypalMeaning: "The forest represents the unconscious mind, the unknown, and the place of transformation. It's where fairy tale heroes face their trials and where we encounter both wisdom and danger.",
    positiveAspect: "Natural wisdom, growth, connection to nature, spiritual journey, finding your path, inner resources.",
    negativeAspect: "Being lost, confusion, hidden dangers, fear of the unknown, feeling overwhelmed by the unconscious.",
    category: "Nature"
  },
  {
    name: "Mirror",
    archetypalMeaning: "Mirrors symbolize self-reflection, truth, and the confrontation with one's true nature. They can reveal both the conscious self and the hidden shadow aspects of personality.",
    positiveAspect: "Self-awareness, truth, clarity, honest self-examination, seeing yourself clearly, wisdom.",
    negativeAspect: "Vanity, self-deception, fear of seeing your true self, confronting unwanted aspects of personality, or distorted self-image.",
    category: "Objects"
  },
  {
    name: "Bridge",
    archetypalMeaning: "Bridges represent transition, connection between different states of being, and the passage from one phase of life to another. They symbolize the link between conscious and unconscious, known and unknown.",
    positiveAspect: "Transition, connection, overcoming obstacles, linking different aspects of life, progress, moving forward.",
    negativeAspect: "Fear of change, anxiety about crossing into unknown territory, feeling stuck between two worlds, or fear of commitment to a new path.",
    category: "Structures"
  },
  {
    name: "Child",
    archetypalMeaning: "The child represents innocence, new beginnings, potential, and the authentic self. It can symbolize both vulnerability and the pure, unconditioned aspects of your nature.",
    positiveAspect: "Innocence, new beginnings, potential, authenticity, wonder, spontaneity, and connection to your true nature.",
    negativeAspect: "Vulnerability, helplessness, immaturity, fear of responsibility, or regression to earlier developmental stages.",
    category: "People"
  },
  {
    name: "Tree",
    archetypalMeaning: "The tree is a powerful symbol of growth, connection between earth and sky, and the axis mundi - the center of the world. It represents the self's development through time and the connection between conscious and unconscious realms.",
    positiveAspect: "Growth, stability, wisdom, connection to nature, spiritual grounding, life force, and the integration of different levels of being.",
    negativeAspect: "Being stuck, rigid thinking, inability to adapt, or feeling rooted in unhealthy patterns.",
    category: "Nature"
  },
  {
    name: "Mountain",
    archetypalMeaning: "Mountains represent spiritual aspiration, the journey toward higher consciousness, and the challenges that must be overcome to reach enlightenment. They symbolize both the goal and the obstacles on the path.",
    positiveAspect: "Spiritual aspiration, achievement, perspective, stability, connection to the divine, and overcoming challenges.",
    negativeAspect: "Insurmountable obstacles, isolation, cold detachment, or the burden of high expectations.",
    category: "Nature"
  },
  {
    name: "Sun",
    archetypalMeaning: "The sun represents consciousness, enlightenment, the masculine principle, and the ego. It symbolizes clarity, truth, and the illuminating power of awareness.",
    positiveAspect: "Consciousness, enlightenment, vitality, truth, clarity, masculine energy, and life-giving power.",
    negativeAspect: "Ego inflation, harsh judgment, burning out, excessive rationality, or blinding pride.",
    category: "Celestial"
  },
  {
    name: "Moon",
    archetypalMeaning: "The moon represents the feminine principle, intuition, cycles, and the mysterious aspects of the psyche. It governs emotions, dreams, and the hidden realms of consciousness.",
    positiveAspect: "Intuition, feminine wisdom, emotional depth, cycles of renewal, mystery, and connection to the unconscious.",
    negativeAspect: "Emotional instability, illusion, deception, moodiness, or being lost in fantasy.",
    category: "Celestial"
  },
  {
    name: "Cave",
    archetypalMeaning: "The cave represents the womb, the unconscious mind, and the place of inner transformation. It's where one goes to face the shadow and emerge reborn.",
    positiveAspect: "Inner wisdom, spiritual retreat, transformation, protection, and connection to the earth mother.",
    negativeAspect: "Isolation, depression, being trapped in the unconscious, or fear of inner exploration.",
    category: "Structures"
  },
  {
    name: "Bird",
    archetypalMeaning: "Birds represent the soul, spiritual messengers, and the connection between earth and heaven. They symbolize freedom, transcendence, and the ability to see from higher perspectives.",
    positiveAspect: "Freedom, spiritual messages, transcendence, perspective, communication with the divine, and liberation.",
    negativeAspect: "Escapism, flightiness, inability to ground, or messages of warning and doom.",
    category: "Animals"
  },
  {
    name: "Wolf",
    archetypalMeaning: "The wolf represents the wild, instinctual nature, loyalty, and the shadow aspects of the psyche. It can symbolize both the teacher and the threat from the unconscious.",
    positiveAspect: "Instinctual wisdom, loyalty, protection, teaching, and connection to wild nature.",
    negativeAspect: "Destructive instincts, predatory behavior, pack mentality, or being consumed by shadow impulses.",
    category: "Animals"
  },
  {
    name: "Door",
    archetypalMeaning: "Doors represent opportunities, transitions, and the threshold between different states of consciousness. They symbolize choice and the passage from one phase of life to another.",
    positiveAspect: "New opportunities, transitions, choices, opening to new experiences, and spiritual passages.",
    negativeAspect: "Closed opportunities, fear of change, being locked out, or anxiety about unknown territories.",
    category: "Structures"
  },
  {
    name: "Key",
    archetypalMeaning: "Keys represent knowledge, secrets, access to hidden realms, and the power to unlock mysteries. They symbolize the tools needed for spiritual and psychological development.",
    positiveAspect: "Knowledge, access to wisdom, unlocking potential, secrets revealed, and spiritual tools.",
    negativeAspect: "Forbidden knowledge, being locked out, lost opportunities, or the burden of secrets.",
    category: "Objects"
  },
  {
    name: "Sword",
    archetypalMeaning: "The sword represents discrimination, the power of the mind to cut through illusion, and the masculine principle of action. It symbolizes both protection and the potential for destruction.",
    positiveAspect: "Clarity, discrimination, protection, justice, cutting through illusion, and spiritual warfare against negativity.",
    negativeAspect: "Aggression, violence, harsh judgment, cutting words, or the destructive use of power.",
    category: "Objects"
  },
  {
    name: "Crown",
    archetypalMeaning: "The crown represents authority, spiritual achievement, and the realization of one's highest potential. It symbolizes both earthly power and divine connection.",
    positiveAspect: "Authority, achievement, spiritual realization, leadership, and connection to higher purpose.",
    negativeAspect: "Ego inflation, abuse of power, false authority, or the burden of responsibility.",
    category: "Objects"
  }
];

export async function seedFirebaseSymbols(): Promise<void> {
  try {
    console.log('Starting Firebase symbols seeding...');
    
    // Check if symbols already exist
    const symbolsCollection = collection(db, 'symbols');
    const existingSymbols = await getDocs(symbolsCollection);
    
    if (existingSymbols.size > 0) {
      console.log(`Found ${existingSymbols.size} existing symbols. Skipping seeding.`);
      return;
    }
    
    // Seed symbols
    for (const symbolData of symbolsData) {
      const symbolDoc = {
        name: symbolData.name,
        archetypalMeaning: symbolData.archetypalMeaning,
        positiveAspect: symbolData.positiveAspect,
        negativeAspect: symbolData.negativeAspect,
        category: symbolData.category,
        frequency: 0 // Initial frequency
      };
      
      // Use symbol name as document ID for easy lookup
      const docId = symbolData.name.toLowerCase().replace(/\s+/g, '-');
      await setDoc(doc(db, 'symbols', docId), symbolDoc);
      
      console.log(`Seeded symbol: ${symbolData.name}`);
    }
    
    console.log(`Successfully seeded ${symbolsData.length} symbols to Firebase!`);
  } catch (error) {
    console.error('Error seeding symbols:', error);
    throw error;
  }
}

// Run the seeding function if this file is executed directly
if (typeof window === 'undefined') {
  seedFirebaseSymbols().catch(console.error);
}
