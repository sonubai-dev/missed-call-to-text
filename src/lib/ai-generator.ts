export type MessageTone = "FRIENDLY" | "PROFESSIONAL" | "URGENT" | "CONCISE";
export type MessageLanguage = "ENGLISH" | "HINDI" | "SPANISH" | "MARATHI";

export interface GenerateOptions {
  businessName: string;
  customerPhone: string;
  customerName?: string;
  missedCallTime?: string;
  tone: MessageTone;
  language: MessageLanguage;
}

export const localMessageGenerator = {
  generate(options: GenerateOptions): { content: string; tone: MessageTone; language: MessageLanguage } {
    const { businessName, customerName, missedCallTime, tone, language } = options;
    const name = customerName?.trim() || "there";
    const time = missedCallTime || "a moment ago";

    // English tone matrices
    if (language === "HINDI") {
      switch (tone) {
        case "FRIENDLY":
          return {
            content: `नमस्ते ${name}! ${businessName} से संपर्क करने के लिए धन्यवाद। आपकी कॉल मिस हो गई थी (${time})। हम आपकी कैसे मदद कर सकते हैं? कृपया यहाँ मैसेज करें।`,
            tone,
            language,
          };
        case "PROFESSIONAL":
          return {
            content: `आदरणीय ${name}, ${businessName} में आपकी कॉल का उत्तर नहीं दे पाने के लिए हमें खेद है। हमारी टीम जल्द आपसे संपर्क करेगी। किसी भी तत्काल प्रश्न के लिए यहाँ उत्तर दें।`,
            tone,
            language,
          };
        case "URGENT":
          return {
            content: `ज़रूरी सूचना: ${name}, हमने ${businessName} पर आपकी कॉल मिस की। क्या यह कोई तत्काल मामला है? कृपया हमें तुरंत सूचित करें ताकि हम प्राथमिकता से मदद कर सकें।`,
            tone,
            language,
          };
        case "CONCISE":
          return {
            content: `नमस्ते ${name}, ${businessName} पर आपकी कॉल छूट गई। हम आपकी क्या सेवा कर सकते हैं?`,
            tone,
            language,
          };
      }
    }

    if (language === "SPANISH") {
      switch (tone) {
        case "FRIENDLY":
          return {
            content: `¡Hola ${name}! Gracias por llamar a ${businessName}. Lamentamos haber perdido su llamada a las ${time}. ¿Cómo podemos ayudarle hoy?`,
            tone,
            language,
          };
        case "PROFESSIONAL":
          return {
            content: `Estimado/a ${name}, disculpe que no hayamos podido atender su llamada en ${businessName}. Estamos a su entera disposición si desea dejarnos un mensaje por aquí.`,
            tone,
            language,
          };
        case "URGENT":
          return {
            content: `AVISO: ${name}, registramos una llamada perdida a ${businessName}. Si es urgente, por favor responda a este chat y le atenderemos de inmediato.`,
            tone,
            language,
          };
        case "CONCISE":
          return {
            content: `Hola ${name}, perdimos su llamada a ${businessName}. ¿En qué podemos ayudarle?`,
            tone,
            language,
          };
      }
    }

    // Default ENGLISH
    switch (tone) {
      case "FRIENDLY":
        return {
          content: `Hi ${name}! Thanks for reaching out to ${businessName}. We noticed we missed your call around ${time}. How can we help you out today? Feel free to reply here! 😊`,
          tone,
          language,
        };
      case "PROFESSIONAL":
        return {
          content: `Dear ${name}, thank you for contacting ${businessName}. We apologize for missing your call. Please let us know the nature of your inquiry so our team can assist you promptly.`,
          tone,
          language,
        };
      case "URGENT":
        return {
          content: `Urgent Follow-Up: Hello ${name}, we just missed your call at ${businessName}. If your request is time-sensitive, please reply right away and we'll escalate it immediately.`,
          tone,
          language,
        };
      case "CONCISE":
        return {
          content: `Hi ${name}, missed your call to ${businessName} at ${time}. How can we help?`,
          tone,
          language,
        };
    }
  },
};
