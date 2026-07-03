import { useEffect, useState } from 'react';

export interface MessageStyles {
  containerBg?: string;
  userBubbleBg?: string;
  userBubbleColor?: string;
  botBubbleBg?: string;
  botBubbleColor?: string;
  borderRadius?: string;
  padding?: string;
  textFieldBg?: string;
  textFieldColor?: string;
  textFieldBorder?: string;
  textFieldPlaceholderColor?: string;
}

const DEFAULT_STYLES: MessageStyles = {
  containerBg: 'transparent',
  userBubbleBg: '#007bff',
  userBubbleColor: 'white',
  botBubbleBg: '#ffffff',
  botBubbleColor: '#333',
  borderRadius: '16px',
  padding: '12px 16px',
  textFieldBg: '',
  textFieldColor: '',
  textFieldBorder: '',
  textFieldPlaceholderColor: '',
};

export const useDynamicMessageStyles = () => {
  const [styles, setStyles] = useState<MessageStyles>(DEFAULT_STYLES);

  useEffect(() => {
    const handleMessageStyles = (event: MessageEvent) => {
      if (event.data?.type === 'UPDATE_MESSAGE_STYLES') {
        const newStyles = event.data.styles;
        setStyles((prev) => ({ ...prev, ...newStyles }));
      }
    };

    window.addEventListener('message', handleMessageStyles);
    return () => window.removeEventListener('message', handleMessageStyles);
  }, []);

  return styles;
};

// Expose to window for easy access
if (typeof window !== 'undefined') {
  (window as any).updateMessageStyles = (styles: MessageStyles) => {
    window.postMessage({
      type: 'UPDATE_MESSAGE_STYLES',
      styles,
    }, '*');
  };
}
