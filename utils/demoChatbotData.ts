
export const DEMO_STARTER_QUESTIONS: string[] = [
  "What can you help me with?",
  "Show me a table",
  "Show me a card",
  "Show me streaming",
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

export const DEMO_STREAMING_ANSWER = `Sure — here's a longer response streamed token by token, the same way a real bridge reply arrives over the wire. Watch the words appear one at a time instead of popping in all at once.

Streaming matters most for longer answers, where a real model is still generating text while the user is already reading it. A few reasons it's worth previewing:

- It gives immediate feedback that the request was received and something is happening.
- Users can start reading and often decide the answer is on-track well before it finishes.
- Long technical explanations, step-by-step guides, and code walkthroughs all feel far more responsive when they stream in gradually rather than appearing as one big block of text after a long, silent wait.

This demo chunk is intentionally padded out with more words than the other canned replies so the streaming effect stays visible for a few seconds — plenty of time to see individual words land one after another instead of the whole message just popping into place instantly.

That's the full picture of how live streaming looks and feels in this chatbot.`;

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


export const isStreamingDemoRequest = (message: string): boolean => {
  return (message || "").toLowerCase().includes("stream");
};

export const getDemoResponse = (message: string): string => {
  const normalized = (message || "").toLowerCase();
  if (normalized.includes("table")) return JSON.stringify(DEMO_TABLE_RESPONSE);
  if (normalized.includes("card")) return JSON.stringify(DEMO_CARD_RESPONSE);
  if (normalized.includes("stream")) return DEMO_STREAMING_ANSWER;
  return DEMO_DEFAULT_ANSWER;
};

export const getDemoFollowUpSuggestions = (message: string): string[] => {
  const normalized = (message || "").toLowerCase();
  if (normalized.includes("table")) return ["Show me a card", "Show me streaming"];
  if (normalized.includes("card")) return ["Show me a table", "Show me streaming"];
  if (normalized.includes("stream")) return ["Show me a table", "Show me a card"];
  return ["Show me streaming", "Show me a table"];
};
