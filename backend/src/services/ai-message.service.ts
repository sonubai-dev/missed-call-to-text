export interface GenerateMessageOptions {
  businessName: string;
  businessCategory?: string;
  customerPhone: string;
  customerName?: string;
  missedCallTime?: string;
  tone?: "PROFESSIONAL" | "FRIENDLY" | "SHORT" | "PREMIUM";
  language?: "ENGLISH" | "HINDI" | "HINGLISH";
}

export class AiMessageService {
  generate(opts: GenerateMessageOptions): {
    content: string;
    tone: string;
    language: string;
    source: "LOCAL_RULE_BASED" | "REMOTE_AI";
  } {
    const tone = opts.tone || "FRIENDLY";
    const language = opts.language || "ENGLISH";
    const business = opts.businessName || "our business";
    const time = opts.missedCallTime || "a moment ago";
    const hasName = !!opts.customerName && opts.customerName.trim().length > 0;
    const name = hasName ? opts.customerName!.trim() : "";

    let content = "";

    if (language === "ENGLISH") {
      switch (tone) {
        case "PROFESSIONAL":
          content = `${name ? `Dear ${name},` : "Hello,"} thank you for contacting ${business}. We apologize for missing your call at ${time}. Please let us know how we may assist you.`;
          break;
        case "FRIENDLY":
          content = `Hi${name ? ` ${name}` : ""}! We noticed that you called ${business}. Sorry we missed your call at ${time}. How can we help you today?`;
          break;
        case "SHORT":
          content = `Hi${name ? ` ${name}` : ""}, missed your call to ${business} at ${time}. How can we help?`;
          break;
        case "PREMIUM":
          content = `Hello ${name || "valued customer"}, thank you for reaching out to ${business}. We regret missing your call at ${time} and look forward to assisting you promptly.`;
          break;
      }
    } else if (language === "HINDI") {
      const greeting = name ? `नमस्ते ${name} जी,` : "नमस्ते,";
      switch (tone) {
        case "PROFESSIONAL":
          content = `${greeting} ${business} में संपर्क करने के लिए धन्यवाद। ${time} पर आया आपका कॉल हम नहीं उठा पाए, इसके लिए हमें खेद है। कृपया बताएं हम आपकी क्या सहायता कर सकते हैं?`;
          break;
        case "FRIENDLY":
          content = `${greeting} ${business} पर कॉल करने के लिए धन्यवाद। क्षमा करें हम आपका कॉल नहीं उठा सके। हम आपकी क्या मदद कर सकते हैं?`;
          break;
        case "SHORT":
          content = `${greeting} ${business} पर आपका कॉल छूट गया। बताएं हम आपकी क्या मदद कर सकते हैं?`;
          break;
        case "PREMIUM":
          content = `${greeting} ${business} में आपका स्वागत है। ${time} पर आपका कॉल हम अटेंड नहीं कर सके। कृपया अपनी आवश्यकता बताएं, हम तुरंत संपर्क करेंगे।`;
          break;
      }
    } else if (language === "HINGLISH") {
      const greeting = name ? `Hi ${name}!` : "Hi!";
      switch (tone) {
        case "PROFESSIONAL":
          content = `Hello ${name ? `${name} ji` : ""}, ${business} par call karne ke liye thank you. ${time} par aaya aapka call hum attend nahi kar paaye. Please batayein hum aapki kaise help kar sakte hain?`;
          break;
        case "FRIENDLY":
          content = `${greeting} Humne notice kiya aapne ${business} par call kiya tha. Sorry hum aapka call miss kar gaye. Batayein hum aapki kya help kar sakte hain?`;
          break;
        case "SHORT":
          content = `${greeting} ${business} par aapka call miss ho gaya at ${time}. How can we help?`;
          break;
        case "PREMIUM":
          content = `${greeting} ${business} me contact karne ke liye dhanyawad. We regret missing your call at ${time}. Please batayein aapko kya help chahiye, hum jaldi update denge.`;
          break;
      }
    }

    return {
      content: content.trim(),
      tone,
      language,
      source: "LOCAL_RULE_BASED",
    };
  }
}

export const aiMessageService = new AiMessageService();
