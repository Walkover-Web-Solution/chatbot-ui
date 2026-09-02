
export const DEMO_STARTER_QUESTIONS: string[] = [
  "What can you help me with?",
  "Show me a table",
  "Show me a card",
  "How do I get started?",
];

export const DEMO_DEFAULT_ANSWER = `This is a **demo response** from the test chatbot — connect a real bridge and token to get live AI answers. Meanwhile, here's a preview of what rich responses look like:

Things this chatbot can render:

- **Bold** and _italic_ text
- Bulleted and numbered lists
- Inline \`code\` and fenced code blocks
- [Links](https://gtwy.ai) to external resources

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

Try "Show me a table" or "Show me a card" to see structured richUI components instead of markdown.`;

const DEMO_TABLE_RESPONSE = {
  type: "Table",
  zebra: true,
  hover: true,
  columns: [
    { label: "Plan", key: "plan" },
    { label: "Price", key: "price" },
    { label: "Status", key: "status", align: "center" },
  ],
  data: [
    { plan: "Starter", price: "$0/mo", status: "Active" },
    { plan: "Pro", price: "$29/mo", status: "Trial" },
    { plan: "Enterprise", price: "Custom", status: "-" },
  ],
};

const DEMO_CARD_RESPONSE = {
  type: "Card",
  variant: "elevated",
  children: [
    { type: "Title", value: "Demo Card", level: 3 },
    { type: "Text", value: "This card is rendered from structured JSON (a richUI component tree), not markdown." },
    { type: "Divider" },
    {
      type: "Row",
      gap: 2,
      children: [
        { type: "Badge", label: "Demo", variant: "ghost" },
        { type: "Badge", label: "richUI", variant: "primary" },
      ],
    },
    {
      type: "Button",
      label: "Show me a table",
      variant: "primary",
      onClickAction: { type: "reply", text: "Show me a table" },
    },
  ],
};


export const getDemoResponse = (message: string): string => {
  const normalized = (message || "").toLowerCase();
  if (normalized.includes("table")) return JSON.stringify(DEMO_TABLE_RESPONSE);
  if (normalized.includes("card")) return JSON.stringify(DEMO_CARD_RESPONSE);
  return DEMO_DEFAULT_ANSWER;
};

export const getDemoFollowUpSuggestions = (message: string): string[] => {
  const normalized = (message || "").toLowerCase();
  if (normalized.includes("table")) return ["Show me a card", "What can you help me with?"];
  if (normalized.includes("card")) return ["Show me a table", "What can you help me with?"];
  return ["Show me a table", "Show me a card"];
};
