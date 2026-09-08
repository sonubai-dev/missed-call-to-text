export interface TemplateVariables {
  name?: string;
  phone?: string;
  business_name?: string;
  date?: string;
  time?: string;
}

export const AVAILABLE_VARIABLES = [
  { tag: "{{name}}", label: "Customer Name", example: "Rahul" },
  { tag: "{{phone}}", label: "Phone Number", example: "+91 98765 43210" },
  { tag: "{{business_name}}", label: "Business Name", example: "Apex Electronics" },
  { tag: "{{date}}", label: "Call Date", example: "Sep 2, 2026" },
  { tag: "{{time}}", label: "Call Time", example: "7:32 PM" },
];

export function renderTemplate(
  template: string,
  vars: TemplateVariables
): string {
  const hasName = !!vars.name && vars.name.trim().length > 0 && vars.name !== vars.phone;
  const nameReplacement = hasName ? vars.name! : "there";

  const now = new Date();
  const dateStr = vars.date || now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeStr = vars.time || now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const businessName = vars.business_name || "our team";
  const phone = vars.phone || "";

  let result = template;

  if (!hasName) {
    result = result
      .replace(/Hi\s+\{\{name\}\},?/gi, "Hi!")
      .replace(/Hello\s+\{\{name\}\},?/gi, "Hello,")
      .replace(/Dear\s+\{\{name\}\},?/gi, "Hello,");
  }

  return result
    .replace(/\{\{name\}\}/gi, nameReplacement)
    .replace(/\{\{phone\}\}/gi, phone)
    .replace(/\{\{business_name\}\}/gi, businessName)
    .replace(/\{\{date\}\}/gi, dateStr)
    .replace(/\{\{time\}\}/gi, timeStr)
    .trim();
}
