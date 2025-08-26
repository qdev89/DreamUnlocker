import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyBKqJGZKqJGZKqJGZKqJGZKqJGZKqJGZKq",
  authDomain: "dream-unlocker-mvp.firebaseapp.com",
  projectId: "dream-unlocker-mvp",
  storageBucket: "dream-unlocker-mvp.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnopqr"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Symbol data from the backend
const symbols = [
  {
    id: "water",
    name: "Water",
    archetypalMeaning: "The unconscious, emotions, purification, and the flow of life. Water represents the depths of the psyche and emotional cleansing.",
    positiveAspect: "Emotional healing, intuitive wisdom, spiritual cleansing, life-giving force",
    negativeAspect: "Overwhelming emotions, drowning in the unconscious, emotional chaos",
    category: "nature",
    frequency: 0
  },
  {
    id: "snake",
    name: "Snake",
    archetypalMeaning: "Transformation, healing, wisdom, and the life force. The snake represents renewal through shedding old patterns.",
    positiveAspect: "Healing power, transformation, ancient wisdom, renewal",
    negativeAspect: "Deception, hidden dangers, toxic influences, fear of change",
    category: "animal",
    frequency: 0
  },
  {
    id: "house",
    name: "House",
    archetypalMeaning: "The self, psyche, or personality structure. Different rooms represent different aspects of consciousness.",
    positiveAspect: "Security, self-knowledge, personal foundation, inner sanctuary",
    negativeAspect: "Psychological imprisonment, rigid thinking, fear of exploration",
    category: "structure",
    frequency: 0
  },
  {
    id: "death",
    name: "Death",
    archetypalMeaning: "Transformation, endings that lead to new beginnings, and the natural cycle of life. Rarely literal death.",
    positiveAspect: "Transformation, release, spiritual rebirth, letting go",
    negativeAspect: "Fear of change, resistance to growth, stagnation",
    category: "concept",
    frequency: 0
  },
  {
    id: "child",
    name: "Child",
    archetypalMeaning: "New potential, innocence, spontaneity, and the divine child within. Represents new beginnings and pure potential.",
    positiveAspect: "New possibilities, innocence, joy, creative potential",
    negativeAspect: "Immaturity, vulnerability, regression, irresponsibility",
    category: "person",
    frequency: 0
  },
  {
    id: "tree",
    name: "Tree",
    archetypalMeaning: "Growth, connection between earth and sky, the axis of life, and personal development rooted in wisdom.",
    positiveAspect: "Growth, stability, connection to nature, spiritual grounding",
    negativeAspect: "Stagnation, being rooted in old patterns, inflexibility",
    category: "nature",
    frequency: 0
  },
  {
    id: "fire",
    name: "Fire",
    archetypalMeaning: "Passion, transformation, purification, and spiritual energy. Fire represents the divine spark and creative force.",
    positiveAspect: "Passion, creativity, purification, spiritual illumination",
    negativeAspect: "Destructive anger, consuming passion, burnout, rage",
    category: "element",
    frequency: 0
  },
  {
    id: "mirror",
    name: "Mirror",
    archetypalMeaning: "Self-reflection, truth, and seeing oneself clearly. The mirror reveals both conscious and unconscious aspects.",
    positiveAspect: "Self-awareness, truth, clarity, honest self-reflection",
    negativeAspect: "Vanity, self-criticism, distorted self-image, fear of truth",
    category: "object",
    frequency: 0
  },
  {
    id: "bird",
    name: "Bird",
    archetypalMeaning: "Freedom, transcendence, messages from the unconscious, and the soul's desire to soar above earthly concerns.",
    positiveAspect: "Freedom, spiritual transcendence, divine messages, liberation",
    negativeAspect: "Escapism, disconnection from reality, flightiness",
    category: "animal",
    frequency: 0
  },
  {
    id: "mountain",
    name: "Mountain",
    archetypalMeaning: "Spiritual aspiration, challenges to overcome, and the journey toward higher consciousness and achievement.",
    positiveAspect: "Spiritual achievement, overcoming obstacles, higher perspective",
    negativeAspect: "Insurmountable challenges, isolation, cold detachment",
    category: "nature",
    frequency: 0
  },
  {
    id: "shadow",
    name: "Shadow",
    archetypalMeaning: "The rejected or hidden aspects of the personality. The shadow contains both negative traits and unrealized potential.",
    positiveAspect: "Hidden potential, integration of rejected aspects, wholeness",
    negativeAspect: "Repressed negativity, fear, unknown dangers, self-sabotage",
    category: "concept",
    frequency: 0
  },
  {
    id: "bridge",
    name: "Bridge",
    archetypalMeaning: "Transition, connection between different states of being, and the path from one phase of life to another.",
    positiveAspect: "Successful transition, connection, overcoming obstacles",
    negativeAspect: "Fear of change, unstable transition, being stuck between worlds",
    category: "structure",
    frequency: 0
  },
  {
    id: "key",
    name: "Key",
    archetypalMeaning: "Solutions, access to hidden knowledge, and the power to unlock new possibilities or understanding.",
    positiveAspect: "Solutions, access to wisdom, unlocking potential, empowerment",
    negativeAspect: "Locked out, missing opportunities, secrets kept hidden",
    category: "object",
    frequency: 0
  },
  {
    id: "ocean",
    name: "Ocean",
    archetypalMeaning: "The vast unconscious, collective memory, and the source of all life. Represents the depths of the psyche.",
    positiveAspect: "Vast wisdom, collective consciousness, life source, emotional depth",
    negativeAspect: "Overwhelming emotions, being lost in the unconscious, chaos",
    category: "nature",
    frequency: 0
  },
  {
    id: "door",
    name: "Door",
    archetypalMeaning: "Opportunities, transitions, and access to new experiences or levels of consciousness.",
    positiveAspect: "New opportunities, access, positive transitions, openness",
    negativeAspect: "Blocked opportunities, fear of the unknown, closed off",
    category: "structure",
    frequency: 0
  },
  {
    id: "sun",
    name: "Sun",
    archetypalMeaning: "Consciousness, enlightenment, life force, and the masculine principle. The sun represents clarity and awareness.",
    positiveAspect: "Enlightenment, vitality, clarity, conscious awareness",
    negativeAspect: "Harsh judgment, burning out, excessive ego, blinding pride",
    category: "celestial",
    frequency: 0
  },
  {
    id: "moon",
    name: "Moon",
    archetypalMeaning: "The feminine principle, intuition, cycles, and the mysterious aspects of the unconscious.",
    positiveAspect: "Intuitive wisdom, natural cycles, feminine power, mystery",
    negativeAspect: "Illusion, moodiness, being lost in fantasy, emotional instability",
    category: "celestial",
    frequency: 0
  },
  {
    id: "wolf",
    name: "Wolf",
    archetypalMeaning: "Instinctual wisdom, loyalty, the wild nature, and the balance between civilization and primal instincts.",
    positiveAspect: "Instinctual wisdom, loyalty, protection, wild freedom",
    negativeAspect: "Predatory behavior, pack mentality, aggressive instincts",
    category: "animal",
    frequency: 0
  },
  {
    id: "garden",
    name: "Garden",
    archetypalMeaning: "Cultivation of the soul, paradise, and the careful tending of one's inner life and personal growth.",
    positiveAspect: "Personal growth, cultivation, paradise, inner beauty",
    negativeAspect: "Artificial control, loss of wildness, superficial beauty",
    category: "nature",
    frequency: 0
  },
  {
    id: "storm",
    name: "Storm",
    archetypalMeaning: "Emotional upheaval, transformation through chaos, and the cleansing power of intense experience.",
    positiveAspect: "Cleansing change, emotional release, transformative power",
    negativeAspect: "Destructive chaos, overwhelming emotions, loss of control",
    category: "weather",
    frequency: 0
  },
  {
    id: "crown",
    name: "Crown",
    archetypalMeaning: "Authority, achievement, recognition, and the realization of one's highest potential and spiritual authority.",
    positiveAspect: "Achievement, recognition, spiritual authority, self-mastery",
    negativeAspect: "Arrogance, abuse of power, false authority, ego inflation",
    category: "object",
    frequency: 0
  }
];

async function seedSymbols() {
  console.log('Starting to seed symbols...');
  
  try {
    for (const symbol of symbols) {
      await setDoc(doc(db, 'symbols', symbol.id), symbol);
      console.log(`Added symbol: ${symbol.name}`);
    }
    
    console.log('Successfully seeded all symbols!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding symbols:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedSymbols();
