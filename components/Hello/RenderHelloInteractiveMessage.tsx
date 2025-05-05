import React, { useContext } from 'react';
import { MessageContext } from '../Interface-Chatbot/InterfaceChatbot';
import ImageWithFallback from '../Interface-Chatbot/Messages/ImageWithFallback';

function RenderHelloInteractiveMessage({ message }: { message: any }) {
  const messageJson = message?.messageJson || {};

  const {
    sendMessageToHello
  } = useContext(MessageContext);

  const renderHeader = (header: any) => {
    console.log(header, "header")
    if (header?.type === "text") {
      return <div className="font-medium mb-2">{header?.text}</div>;
    } else if (header?.type === 'video') {
      return <ImageWithFallback src={header?.video?.link} alt="header" />;
    } else if (header?.type === "image") {
      return <ImageWithFallback src={header?.image?.link} alt="header" />;
    } else if(header?.type === "document"){
      return <ImageWithFallback src={header?.document?.link} alt="header" />;
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
              <div className="mb-2">{messageJson.body.text}</div>
            )}

            {messageJson.footer?.text && (
              <div className="text-xs text-gray-500 mb-2">{messageJson.footer.text}</div>
            )}

            {messageJson.action?.buttons && (
              <div className="flex flex-col gap-2">
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
        console.log(messageJson, "messageJson")
        return (
          <div className="flex flex-col gap-2">
                  {messageJson.header && renderHeader(messageJson.header)}
            {messageJson.body?.text && (
              <div className="mb-2">{messageJson.body.text}</div>
            )}

            {messageJson.footer?.text && (
              <div className="text-xs text-gray-500 mb-2">{messageJson.footer.text}</div>
            )}

            {messageJson.action?.parameters && (
              <div className="mt-2">
                <a
                  href={messageJson.action.parameters.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-primary"
                >
                  {messageJson.action.parameters.display_text || 'View'}
                </a>
              </div>
            )}
          </div>
        );

      case 'list':
        return (
          <div className="flex flex-col gap-2">
            {messageJson.header?.text && (
              <div className="font-medium mb-2">{messageJson.header.text}</div>
            )}

            {messageJson.body?.text && (
              <div className="mb-2">{messageJson.body.text}</div>
            )}

            {messageJson.footer?.text && (
              <div className="text-xs text-gray-500 mb-2">{messageJson.footer.text}</div>
            )}

            {messageJson.action?.sections && (
              <div className="mt-2">
                <div className="border rounded-md overflow-hidden">
                  {messageJson.action.sections.map((section: any, sectionIndex: number) => (
                    <div key={sectionIndex} className="mb-3">
                      {section.title && (
                        <div className="bg-gray-100 px-3 py-2 font-medium text-sm">
                          {section.title}
                        </div>
                      )}
                      <div className="grid gap-2 p-2">
                        {section.rows.map((row: any, rowIndex: number) => (
                          <button
                            key={row.id || rowIndex}
                            className="btn btn-sm btn-outline w-full justify-center normal-case max-w-lg "
                            onClick={() => sendMessageToHello?.(row?.title)}
                          >
                            <div className="flex flex-col">
                              <div className="font-medium">{row.title}</div>
                              {row.description && (
                                <div className="text-xs text-gray-500">{row.description}</div>
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
          </div>
        );

      default:
        return <div>Unsupported Message</div>;
    }
  };

  return (
    <div className="interactive-message">
      {renderInteractiveContent()}
    </div>
  );
}

export default RenderHelloInteractiveMessage;