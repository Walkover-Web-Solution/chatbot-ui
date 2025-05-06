import React, { useContext } from 'react';
import { MessageContext } from '../Interface-Chatbot/InterfaceChatbot';
import ImageWithFallback from '../Interface-Chatbot/Messages/ImageWithFallback';

function RenderHelloInteractiveMessage({ message }: { message: any }) {
  const messageJson = message?.messageJson || {};

  const {
    sendMessageToHello
  } = useContext(MessageContext);

  const renderHeader = (header: any) => {
    if (header?.type === "text") {
      return <div className="font-semibold mb-2">{header?.text}</div>;
    } else if (header?.type === 'video') {
      return (
        <div className="mb-1 rounded-lg overflow-hidden shadow-sm">
          <ImageWithFallback src={header?.video?.link} alt="header" />
        </div>
      );
    } else if (header?.type === "image") {
      return (
        <div className="mb-1 rounded-lg overflow-hidden shadow-sm">
          <ImageWithFallback src={header?.image?.link} alt="header" />
        </div>
      );
    } else if (header?.type === "document") {
      return (
        <div className="mb-1 rounded-lg overflow-hidden shadow-sm">
          <ImageWithFallback src={header?.document?.link} alt="header" />
        </div>
      );
    }
    return null;
  };

  const renderInteractiveContent = () => {
    switch (messageJson.type) {
      case 'button':
        return (
          <div className="flex flex-col gap-2">
            {messageJson.header && renderHeader(messageJson.header)}

            {messageJson.body?.text && (
              <p className="mb-1">{messageJson?.body?.text}</p>
            )}

            {messageJson.footer?.text && (
              <p className="text-xs text-gray-800 mb-1">{messageJson?.footer?.text}</p>
            )}

            {messageJson.action?.buttons && (
              <div className="flex flex-col gap-2 mt-1">
                {messageJson.action.buttons.map((button: any, index: number) => (
                  <button
                    key={index}
                    className="btn btn-sm btn-outline w-full max-w-lg rounded-md"
                    onClick={() => sendMessageToHello?.(button?.reply?.title)}
                  >
                    {button.reply?.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'cta_url':
        return (
          <div className="flex flex-col gap-3">
            {messageJson.header && renderHeader(messageJson.header)}

            {messageJson.body?.text && (
              <div className="mb-1">{messageJson?.body?.text}</div>
            )}

            {messageJson.footer?.text && (
              <div className="text-xs text-gray-800 mb-1">{messageJson?.footer?.text}</div>
            )}

            {messageJson.action?.parameters && (
              <div className="mt-2">
                <a
                  href={messageJson?.action?.parameters?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline rounded-md px-4 py-2 inline-flex items-center gap-2 "
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  {messageJson.action?.parameters?.display_text || 'View'}
                </a>
              </div>
            )}
          </div>
        );

      case 'list':
        return (
          <div className="flex flex-col gap-3">
            {messageJson?.header && renderHeader(messageJson?.header)}

            {messageJson?.body?.text && (
              <div className="mb-1">{messageJson?.body?.text}</div>
            )}

            {messageJson?.action?.sections && (
              <div className="mt-2">
                <div className="border rounded-lg overflow-hidden">
                  {messageJson?.action?.sections?.map((section: any, sectionIndex: number) => (
                    <div key={sectionIndex} className="mb-2">
                      {section?.title && (
                        <div className="bg-gray-100 px-4 py-2 font-medium text-sm">
                          {section?.title}
                        </div>
                      )}
                      <div className="grid gap-2 p-3">
                        {section?.rows?.map((row: any, rowIndex: number) => (
                          <button
                            key={row?.id || rowIndex}
                            className="btn btn-sm btn-outline w-full justify-start text-left px-4 py-3 rounded-md"
                            onClick={() => sendMessageToHello?.(row?.title)}
                          >
                            <div className="flex flex-col">
                              <div className="font-medium">{row?.title}</div>
                              {row?.description && (
                                <div className="text-xs text-gray-500 mt-1">{row?.description}</div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {messageJson?.footer?.text && (
              <div className="text-xs text-gray-800 mt-2 italic">{messageJson?.footer?.text}</div>
            )}
          </div>
        );

      default:
        return <div className="p-3 bg-gray-800 rounded-md">Unsupported Message Type</div>;
    }
  };

  return (
    <div className="interactive-message border border-gray-200 rounded-lg p-3" style={{ backgroundColor: '#f0f0f0' }}>
      {renderInteractiveContent()}
    </div>
  );
}

export default RenderHelloInteractiveMessage;