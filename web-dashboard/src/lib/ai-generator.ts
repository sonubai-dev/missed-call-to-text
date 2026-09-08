export type MessageTone = 'PROFESSIONAL' | 'FRIENDLY' | 'SHORT' | 'PREMIUM';
export type MessageLanguage = 'ENGLISH' | 'HINDI' | 'HINGLISH';

export interface MessageGenerationRequest {
  businessName: string;
  businessCategory?: string;
  customerPhone: string;
  customerName?: string;
  missedCallTime: string;
  tone: MessageTone;
  language: MessageLanguage;
}

export interface GeneratedResult {
  content: string;
  tone: MessageTone;
  language: MessageLanguage;
  source: 'LOCAL_RULE_BASED' | 'REMOTE_AI';
}

/**
 * Local-first AI & rule-based message generator for Web Dashboard.
 * Works 100% offline without mandatory AI keys or cloud services.
 */
export class LocalMessageGenerator {
  generate(req: MessageGenerationRequest): GeneratedResult {
    const hasName = !!req.customerName && req.customerName.trim().length > 0 && req.customerName !== req.customerPhone;
    const name = hasName ? req.customerName!.trim() : "";
    const business = req.businessName || "our team";
    const time = req.missedCallTime || "a moment ago";

    let content = "";
    switch (req.language) {
      case "ENGLISH":
        content = this.generateEnglish(name, business, time, req.tone);
        break;
      case "HINDI":
        content = this.generateHindi(name, business, time, req.tone);
        break;
      case "HINGLISH":
        content = this.generateHinglish(name, business, time, req.tone);
        break;
    }

    return {
      content: content.trim(),
      tone: req.tone,
      language: req.language,
      source: "LOCAL_RULE_BASED",
    };
  }

  private generateEnglish(name: string, business: string, time: string, tone: MessageTone): string {
    const greeting = name ? `Hi ${name}!` : "Hi!";
    const formalGreeting = name ? `Dear ${name},` : "Hello,";

    switch (tone) {
      case "PROFESSIONAL":
        return `${formalGreeting} thank you for reaching out to ${business}. We apologize for missing your call at ${time}. Please let us know how we may assist you.`;
      case "FRIENDLY":
        return `${greeting} We noticed that you called ${business}. Sorry we missed your call at ${time}. How can we help you today?`;
      case "SHORT":
        return `${greeting} missed your call to ${business} at ${time}. How can we help?`;
      case "PREMIUM":
        return `Hello ${name || "valued customer"}, thank you for contacting ${business}. We regret missing your call at ${time} and look forward to assisting you promptly.`;
    }
  }

  private generateHindi(name: string, business: string, time: string, tone: MessageTone): string {
    const greeting = name ? `नमस्ते ${name} जी,` : "नमस्ते,";

    switch (tone) {
      case "PROFESSIONAL":
        return `${greeting} ${business} में संपर्क करने के लिए धन्यवाद। ${time} पर आया आपका कॉल हम नहीं उठा पाए, इसके लिए हमें खेद है। कृपया बताएं हम आपकी क्या सहायता कर सकते हैं?`;
      case "FRIENDLY":
        return `${greeting} ${business} पर कॉल करने के लिए धन्यवाद। क्षमा करें हम आपका कॉल नहीं उठा सके। हम आपकी क्या मदद कर सकते हैं?`;
      case "SHORT":
        return `${greeting} ${business} पर आपका कॉल छूट गया। बताएं हम आपकी क्या मदद कर सकते हैं?`;
      case "PREMIUM":
        return `${greeting} ${business} में आपका स्वागत है। ${time} पर आपका कॉल हम अटेंड नहीं कर सके। कृपया अपनी आवश्यकता बताएं, हम तुरंत संपर्क करेंगे।`;
    }
  }

  private generateHinglish(name: string, business: string, time: string, tone: MessageTone): string {
    const greeting = name ? `Hi ${name}!` : "Hi!";

    switch (tone) {
      case "PROFESSIONAL":
        return `Hello ${name ? `${name} ji` : ""}, ${business} par call karne ke liye thank you. ${time} par aaya aapka call hum attend nahi kar paaye. Please batayein hum aapki kaise help kar sakte hain?`;
      case "FRIENDLY":
        return `${greeting} Humne notice kiya aapne ${business} par call kiya tha. Sorry hum aapka call miss kar gaye. Batayein hum aapki kya help kar sakte hain?`;
      case "SHORT":
        return `${greeting} ${business} par aapka call miss ho gaya at ${time}. How can we help?`;
      case "PREMIUM":
        return `${greeting} ${business} me contact karne ke liye dhanyawad. We regret missing your call at ${time}. Please batayein aapko kya help chahiye, hum jaldi update denge.`;
    }
  }
}

export const localMessageGenerator = new LocalMessageGenerator();
