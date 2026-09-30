export interface TemplateContext {
  name?: string;
  phone?: string;
  business_name?: string;
  owner_name?: string;
  date?: string;
  time?: string;
}

export const AVAILABLE_VARIABLES = [
  { tag: "{{name}}", label: "Caller Name", sample: "Rajesh Sharma" },
  { tag: "{{business_name}}", label: "Business Name", sample: "Apex Electronics" },
  { tag: "{{owner_name}}", label: "Owner Name", sample: "Sonu Bai" },
  { tag: "{{phone}}", label: "Phone Number", sample: "+91 98765 43210" },
  { tag: "{{time}}", label: "Missed Call Time", sample: "10:30 AM" },
  { tag: "{{date}}", label: "Missed Call Date", sample: "Today" },
];

export function renderTemplate(template: string, context: TemplateContext): string {
  let result = template;
  result = result.replace(/\{\{\s*name\s*\}\}/gi, context.name?.trim() || "there");
  result = result.replace(/\{\{\s*business_name\s*\}\}/gi, context.business_name?.trim() || "our team");
  result = result.replace(/\{\{\s*owner_name\s*\}\}/gi, context.owner_name?.trim() || "Business Representative");
  result = result.replace(/\{\{\s*phone\s*\}\}/gi, context.phone?.trim() || "");
  result = result.replace(/\{\{\s*time\s*\}\}/gi, context.time?.trim() || "earlier");
  result = result.replace(/\{\{\s*date\s*\}\}/gi, context.date?.trim() || "today");
  return result;
}
