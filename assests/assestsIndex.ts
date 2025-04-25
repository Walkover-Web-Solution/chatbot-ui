import aiIcon from "./aiLogo.png";
import defaultApp from "./App.png";
import chatbotGif from "./chatbotGif.gif";
import humanIcon from "./human-icon.svg";
import socketIcon from "./socketIcon.png";
import userAssistant from "./user-assistant.png";
import socketAIIcon from "./Viasocket_AI.svg";
import docIcon from "./docLogo.svg";
import pdfIcon from "./pdfLogo.svg";
import csvIcon from "./csvLogo.svg";

export const ChatBotIcon = socketAIIcon;
export const SocketIcon = socketIcon;
export const DefaultApp = defaultApp;
export const AiIcon = aiIcon;
export const HumanIcon = humanIcon;
export const ChatBotGif = chatbotGif;
export const UserAssistant = userAssistant;
export const PdfLogo = pdfIcon;
export const CsvLogo = csvIcon;
export const DocLogo = docIcon;

function makeImageUrl(imageId: string): string {
  return `https://imagedelivery.net/Vv7GgOGQbSyClWJqhyP0VQ/${imageId}/public`;
}

export const AI_WHITE_ICON = makeImageUrl(
  "b1357e23-2fc6-4dc3-855a-7a213b1fa100"
);
export const AI_BLACK_ICON = makeImageUrl(
  "91ee0bff-cfe3-4e2d-64e5-fadbd9a3a200"
);
