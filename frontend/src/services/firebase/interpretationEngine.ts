import { firebaseSymbolsService, firebaseAnalyticsService } from './index';
import type { Dream } from './dreamsService';
import type { Symbol as DreamSymbol } from './symbolsService';

export interface SymbolInterpretation {
  symbolName: string;
  archetypalMeaning: string;
  personalizedInterpretation: string;
  lightAspect: string;
  shadowAspect: string;
  category: string;
  userFrequency: number;
}

export interface EmotionalInsight {
  emotionName: string;
  insight: string;
  jungianPerspective: string;
  category: string;
}

export interface ShadowWork {
  shadowElements: string[];
  shadowInterpretation: string;
  integrationQuestions: string[];
  guidanceMessage: string;
}

export interface GeneratedInterpretation {
  overallTheme: string;
  primaryMessage: string;
  symbolInterpretations: SymbolInterpretation[];
  emotionalInsights: EmotionalInsight[];
  exploratoryQuestions: string[];
  shadowWork: ShadowWork | null;
  integrationSuggestion: string;
}

class InterpretationEngine {
  
  async generateInterpretation(
    userId: string, 
    dream: Dream, 
    includeShadowWork: boolean = true
  ): Promise<GeneratedInterpretation> {
    try {
      // Get symbol data for interpretation
      const symbolInterpretations = await this.generateSymbolInterpretations(userId, dream.symbols);
      const emotionalInsights = await this.generateEmotionalInsights(dream.emotions);
      const overallTheme = this.determineOverallTheme(symbolInterpretations);
      const primaryMessage = this.generatePrimaryMessage(overallTheme);
      const exploratoryQuestions = this.generateExploratoryQuestions(dream);
      const shadowWork = includeShadowWork ? await this.generateShadowWork(dream) : null;
      const integrationSuggestion = this.generateIntegrationSuggestion(overallTheme);

      return {
        overallTheme,
        primaryMessage,
        symbolInterpretations,
        emotionalInsights,
        exploratoryQuestions,
        shadowWork,
        integrationSuggestion
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate interpretation');
    }
  }

  private async generateSymbolInterpretations(userId: string, symbolNames: string[]): Promise<SymbolInterpretation[]> {
    const interpretations: SymbolInterpretation[] = [];
    
    for (const symbolName of symbolNames) {
      try {
        const symbols = await firebaseSymbolsService.searchSymbols(symbolName);
        const symbol = symbols.find(s => s.name.toLowerCase() === symbolName.toLowerCase());
        
        if (symbol) {
          // Get user frequency for this symbol
          const frequencies = await firebaseAnalyticsService.getUserSymbolFrequencies(userId);
          const userFrequency = frequencies.find(f => f.symbolName === symbolName)?.frequency || 0;
          
          interpretations.push({
            symbolName: symbol.name,
            archetypalMeaning: symbol.archetypalMeaning,
            personalizedInterpretation: await this.generatePersonalizedInterpretation(symbol, userFrequency),
            lightAspect: symbol.positiveAspect,
            shadowAspect: symbol.negativeAspect,
            category: symbol.category,
            userFrequency
          });
        }
      } catch (error) {
        console.warn(`Could not interpret symbol: ${symbolName}`, error);
      }
    }
    
    return interpretations;
  }

  private async generateEmotionalInsights(emotionNames: string[]): Promise<EmotionalInsight[]> {
    const insights: EmotionalInsight[] = [];
    
    for (const emotionName of emotionNames) {
      try {
        const emotions = await firebaseSymbolsService.getSymbolsByCategory('emotion');
        const emotion = emotions.find(e => e.name.toLowerCase() === emotionName.toLowerCase());
        
        if (emotion) {
          insights.push({
            emotionName: emotion.name,
            insight: this.generateEmotionalInsight(emotion.name),
            jungianPerspective: this.getJungianEmotionalPerspective(emotion.name),
            category: emotion.category
          });
        }
      } catch (error) {
        console.warn(`Could not analyze emotion: ${emotionName}`, error);
      }
    }
    
    return insights;
  }

  private determineOverallTheme(symbols: SymbolInterpretation[]): string {
    // Analyze symbols for theme patterns
    const categories = symbols.map(s => s.category);
    const symbolNames = symbols.map(s => s.symbolName.toLowerCase());
    
    if (symbolNames.some(name => ['water', 'tree', 'mountain', 'forest'].includes(name)) || 
        categories.includes('nature')) {
      return "Connection and Growth";
    }
    
    if (symbolNames.some(name => ['death', 'snake', 'phoenix', 'butterfly'].includes(name))) {
      return "Transformation and Renewal";
    }
    
    if (symbolNames.some(name => ['house', 'mirror', 'door', 'key'].includes(name))) {
      return "Self-Discovery and Inner Exploration";
    }
    
    if (symbolNames.some(name => ['shadow', 'darkness', 'monster', 'enemy'].includes(name))) {
      return "Shadow Integration and Personal Power";
    }
    
    if (symbolNames.some(name => ['child', 'baby', 'birth', 'mother'].includes(name))) {
      return "New Beginnings and Nurturing";
    }
    
    return "Personal Development and Awareness";
  }

  private generatePrimaryMessage(theme: string): string {
    const messages: Record<string, string> = {
      "Connection and Growth": "Your dream suggests a deep need for connection with your natural self and personal growth. The symbols present indicate a time of flourishing and expansion in your life.",
      "Transformation and Renewal": "This dream speaks to a profound transformation occurring within you. Like the snake shedding its skin, you are releasing old patterns to embrace a renewed version of yourself.",
      "Self-Discovery and Inner Exploration": "Your unconscious is inviting you to explore the deeper chambers of your psyche. This dream offers keys to understanding hidden aspects of your personality.",
      "Shadow Integration and Personal Power": "Your dream is bringing shadow elements to consciousness for integration. This is an opportunity to reclaim disowned parts of yourself and transform them into sources of strength.",
      "New Beginnings and Nurturing": "The symbols in your dream point to new creative potential and the need for nurturing care. Something new is being born in your life that requires gentle attention.",
      "Personal Development and Awareness": "Your dream reflects your ongoing journey of self-development and increasing consciousness. Pay attention to the guidance your unconscious is offering."
    };
    
    return messages[theme] || messages["Personal Development and Awareness"];
  }

  private generateExploratoryQuestions(dream: Dream): string[] {
    const baseQuestions = [
      "What emotions did you experience most strongly in this dream?",
      "Which symbol or image from the dream feels most significant to you?",
      "How do the themes in this dream relate to your current life situation?",
      "What aspects of the dream felt familiar or unfamiliar?",
      "If you could have a conversation with any character or element from the dream, what would you ask?"
    ];

    const symbolQuestions: string[] = [];
    
    // Add symbol-specific questions
    dream.symbols.forEach(symbolName => {
      const questions = this.getSymbolSpecificQuestions(symbolName);
      symbolQuestions.push(...questions);
    });

    return [...baseQuestions, ...symbolQuestions.slice(0, 3)]; // Limit to avoid overwhelming
  }

  private async generateShadowWork(dream: Dream): Promise<ShadowWork> {
    const shadowElements: string[] = [];
    const integrationQuestions: string[] = [];

    // Identify potential shadow elements from symbols
    for (const symbolName of dream.symbols) {
      const shadowAspect = this.getShadowAspect(symbolName);
      if (shadowAspect) {
        shadowElements.push(`${symbolName}: ${shadowAspect}`);
      }
    }

    // Generate integration questions
    if (shadowElements.length > 0) {
      integrationQuestions.push(
        "What rejected or disowned aspects of yourself might these shadow elements represent?",
        "How might you consciously integrate these qualities in a healthy way?",
        "What would it look like to befriend rather than fight these aspects of yourself?"
      );
    }

    const shadowInterpretation = shadowElements.length > 0 
      ? "Your dream contains shadow elements that represent disowned or rejected aspects of your personality. These are not 'bad' parts of you, but rather undeveloped potentials that, when consciously integrated, can become sources of creativity and strength."
      : "This dream appears to focus more on conscious development rather than shadow integration. Continue to be open to dreams that may bring shadow material to your awareness.";

    return {
      shadowElements,
      shadowInterpretation,
      integrationQuestions,
      guidanceMessage: "Remember that shadow work is about integration, not elimination. These aspects of yourself, when consciously acknowledged, can become sources of strength and authenticity."
    };
  }

  private generateIntegrationSuggestion(
    theme: string
  ): string {
    const suggestions: Record<string, string> = {
      "Connection and Growth": "Consider spending time in nature or engaging in activities that foster growth and connection. Journaling about your relationship with the natural world may provide additional insights.",
      "Transformation and Renewal": "Honor this transformative period by creating rituals that mark the transition. Consider what you're ready to release and what you're ready to embrace.",
      "Self-Discovery and Inner Exploration": "Engage in practices that support inner exploration such as meditation, active imagination, or creative expression. Pay attention to recurring themes in your dreams.",
      "Shadow Integration and Personal Power": "Practice self-compassion as you work with shadow material. Consider working with a therapist or counselor experienced in Jungian approaches to support this important work.",
      "New Beginnings and Nurturing": "Create space for new possibilities to emerge. Practice patience and gentle care with yourself as new aspects of your life develop.",
      "Personal Development and Awareness": "Continue your journey of self-discovery through dream work, reflection, and conscious attention to your inner life."
    };
    
    return suggestions[theme] || suggestions["Personal Development and Awareness"];
  }

  // Helper methods
  private async generatePersonalizedInterpretation(symbol: DreamSymbol, userFrequency: number): Promise<string> {
    let interpretation = symbol.archetypalMeaning || 'A meaningful symbol in your dream';
    
    if (userFrequency > 3) {
      interpretation += " This symbol appears frequently in your dreams, suggesting it holds particular significance for your personal development journey.";
    } else if (userFrequency === 0) {
      interpretation += " This is a new symbol in your dream vocabulary, indicating emerging themes or aspects of yourself coming into consciousness.";
    }
    
    return interpretation;
  }

  private generateEmotionalInsight(emotionName: string): string {
    const insights: Record<string, string> = {
      "fear": "Fear in dreams often points to areas where growth is needed. What is the fear protecting you from?",
      "joy": "Joy indicates alignment with your authentic self. What aspects of your life bring this natural happiness?",
      "anger": "Anger may signal boundaries that need attention or energy that needs constructive expression.",
      "sadness": "Sadness can indicate a need for grieving or letting go of something that no longer serves you.",
      "anxiety": "Anxiety often reflects uncertainty about the future or unprocessed concerns from your waking life.",
      "love": "Love in dreams represents connection to your heart center and capacity for compassion.",
      "confusion": "Confusion suggests you're in a transitional phase where new understanding is emerging."
    };
    
    return insights[emotionName.toLowerCase()] || "This emotion carries important information about your inner state and current life circumstances.";
  }

  private getJungianEmotionalPerspective(emotionName: string): string {
    const perspectives: Record<string, string> = {
      "fear": "Fear serves as a guardian of the threshold, protecting the ego from premature encounters with the unconscious.",
      "joy": "Joy represents the natural state of the Self when in harmony with one's authentic nature.",
      "anger": "Anger contains vital energy that, when consciously directed, can fuel necessary changes and boundary-setting.",
      "sadness": "Sadness is the psyche's way of processing loss and making space for new growth.",
      "anxiety": "Anxiety often signals the approach of unconscious content seeking integration into consciousness.",
      "love": "Love reflects the transcendent function that unites opposites and heals psychological splits.",
      "confusion": "Confusion indicates the dissolution of old patterns to make way for new understanding."
    };
    
    return perspectives[emotionName.toLowerCase()] || "This emotion represents an important aspect of your psychological development.";
  }

  private getSymbolSpecificQuestions(symbolName: string): string[] {
    const questions: Record<string, string[]> = {
      "water": [
        "What is your relationship with emotions and the unconscious?",
        "How do you navigate the depths of your inner life?"
      ],
      "house": [
        "What does 'home' mean to you on a psychological level?",
        "Which rooms or areas of your psyche need attention?"
      ],
      "snake": [
        "What transformation is calling to you?",
        "How do you relate to your instinctual wisdom?"
      ],
      "death": [
        "What aspects of your life are ready to be released?",
        "How do you relate to endings and new beginnings?"
      ],
      "child": [
        "What new potential is emerging in your life?",
        "How do you nurture your creative and spontaneous nature?"
      ]
    };
    
    return questions[symbolName.toLowerCase()] || [
      `What personal associations do you have with ${symbolName}?`,
      `How might ${symbolName} relate to your current life situation?`
    ];
  }

  private getShadowAspect(symbolName: string): string | null {
    const shadowAspects: Record<string, string> = {
      "snake": "Repressed instinctual wisdom or sexuality",
      "death": "Avoided endings or fear of transformation",
      "darkness": "Rejected or unknown aspects of personality",
      "monster": "Disowned aggressive or powerful impulses",
      "enemy": "Projected negative qualities",
      "thief": "Disowned desire or sense of entitlement",
      "witch": "Rejected feminine power or intuition",
      "demon": "Repressed vital energy or passion"
    };
    
    return shadowAspects[symbolName.toLowerCase()] || null;
  }
}

export const interpretationEngine = new InterpretationEngine();
