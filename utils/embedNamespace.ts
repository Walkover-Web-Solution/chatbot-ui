// Derives a per-embed namespace from URL params so that multiple chatbot
// iframes (different users/chatbots) loaded on the same parent page do not
// collide on shared sessionStorage / cookies.

let cachedNamespace: string | null = null;

function parseInterfaceDetails(): { chatbot_id?: string; userId?: string } {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("interfaceDetails");
    if (!raw || raw === "undefined") return {};
    const parsed = JSON.parse(raw);
    return {
      chatbot_id: parsed?.chatbot_id || parsed?.chatBotId || undefined,
      userId: parsed?.userId || parsed?.user_id || undefined,
    };
  } catch {
    return {};
  }
}

export const getEmbedNamespace = (): string => {
  if (cachedNamespace !== null) return cachedNamespace;
  const { chatbot_id, userId } = parseInterfaceDetails();
  if (chatbot_id && userId) {
    cachedNamespace = `${chatbot_id}_${userId}`;
  } else {
    cachedNamespace = "";
  }
  return cachedNamespace;
};

export const getScopedKey = (key: string): string => {
  const ns = getEmbedNamespace();
  return ns ? `${ns}_${key}` : key;
};

// For tests / unusual flows
export const resetEmbedNamespace = () => {
  cachedNamespace = null;
};
