import { linkify } from '@/utils/utilities';
import { ExternalLink, MapPin } from 'lucide-react';
import { useColor } from '../Chatbot/hooks/useColor';
import { useSendMessageToHello } from '../Chatbot/hooks/useHelloIntegration';
import ImageWithFallback from '../Interface-Chatbot/Messages/ImageWithFallback';

function RenderHelloInteractiveMessage({ message }: { message: any }) {
  const messageJson = message?.messageJson || {};
  const sendMessageToHello = useSendMessageToHello({});
  const { textColor, backgroundColor } = useColor();

  const renderHeader = (header: any) => {
    if (header?.type === "text") {
      return <div className="font-semibold">{header?.text}</div>;
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
    switch (messageJson?.type || messageJson?.category) {
      case 'button':
      case 'quick_reply':
        return (
          <div className="flex flex-col gap-1">
            {messageJson.header && renderHeader(messageJson.header)}

            {messageJson.body?.text && (
              <div className="mb-1">
                <div dangerouslySetInnerHTML={{ __html: linkify(messageJson?.body?.text) }}></div>
              </div>
            )}

            {messageJson.footer?.text && (
              <div className="text-xs opacity-70 mb-1">
                <div dangerouslySetInnerHTML={{ __html: linkify(messageJson?.footer?.text) }}></div>
              </div>
            )}

            {(messageJson.action?.buttons || messageJson.actions?.buttons) && (
              <div className="flex flex-col gap-2 mt-1 w-fit min-w-40">
                {(messageJson.action?.buttons || messageJson.actions?.buttons)?.map((button: any, index: number) => {
                  const title = button.reply?.title || button?.title;
                  if (button.type === 'url') {
                    return (
                      <a
                        key={index}
                        href={button.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium w-full max-w-md justify-start"
                        style={{ backgroundColor: backgroundColor, color: textColor }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={16} strokeWidth={2} />
                        {title}
                      </a>
                    );
                  }
                  return (
                    <button
                      key={index}
                      className="btn btn-sm btn-outline w-full max-w-md rounded-md normal-case justify-start px-4 font-medium text-inherit border-current"
                      onClick={(e) => {
                        e.stopPropagation();
                        sendMessageToHello?.(title)
                      }}
                    >
                      {title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'cta_url':
        const { header, body, footer, action, actions } = messageJson ?? {};

        const hasHeader = Boolean(header);
        const hasBody = Boolean(body?.text);
        const hasFooter = Boolean(footer?.text);
        const hasAction = Boolean(action?.parameters?.url);

        return (
          <article className="space-y-2 shadow-sm">
            {/* Header (optional) */}
            {hasHeader && renderHeader(header)}

            {/* Body */}
            {hasBody && (
              <section
                className="prose max-w-none text-inherit text-sm"
                dangerouslySetInnerHTML={{ __html: linkify(body.text) }}
              />
            )}

            {/* Footer (optional) */}
            {hasFooter && (
              <footer
                className="text-xs opacity-70"
                dangerouslySetInnerHTML={{ __html: linkify(footer.text) }}
              />
            )}

            {/* CTA button */}
            {hasAction && (
              <div className="pt-2">
                <a
                  href={action.parameters.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg  px-4 py-2 text-sm font-medium"
                  style={{ backgroundColor: backgroundColor, color: textColor }}
                >
                  <ExternalLink size={16} strokeWidth={2} />
                  {action.parameters.display_text || "View"}
                </a>
              </div>
            )}

            {(actions?.buttons)?.map((button: any, index: number) => {
              const title = button.reply?.title || button?.title;
              if (button.type === 'url') {
                return (
                  <a
                    key={index}
                    href={button.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium w-full max-w-md justify-start"
                    style={{ backgroundColor: backgroundColor, color: textColor }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={16} strokeWidth={2} />
                    {title}
                  </a>
                );
              }
              return (
                <button
                  key={index}
                  className="btn btn-sm btn-outline w-full max-w-md rounded-md normal-case justify-start px-4 font-medium text-inherit border-current"
                  onClick={(e) => {
                    e.stopPropagation();
                    sendMessageToHello?.(title)
                  }}
                >
                  {title}
                </button>
              );
            })}
          </article>
        );

      case 'list':
        return (
          <div className="flex flex-col gap-1 min-w-64">
            {messageJson?.header && renderHeader(messageJson?.header)}
            {messageJson?.body?.text && (
              <div className="mb-1 px-1">
                <div
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: linkify(messageJson?.body?.text) }}
                ></div>
              </div>
            )}

            {(messageJson?.action?.sections || messageJson?.actions?.list?.sections) && (
              <div className="overflow-hidden">
                {(messageJson?.action?.sections || messageJson?.actions?.list?.sections)?.map((section: any, sectionIndex: number) => (
                  <div key={sectionIndex} className='mb-2'>
                    {section?.title && (
                      <div className="pt-2 px-1 font-semibold text-base mb-1">
                        {section?.title}
                      </div>
                    )}
                    <ul className="menu menu-sm w-fit min-w-40 p-0 gap-2">
                      {section?.rows?.map((row: any, rowIndex: number) => (
                        <li key={row?.id || rowIndex} className='border border-gray-500 dark:border-inherit rounded-lg'>
                          <a
                            className="py-2"
                            onClick={() => sendMessageToHello?.(row?.title)}
                          >
                            <div className="flex flex-col w-full items-start">
                              <div className="font-medium break-words w-full">{row?.title}</div>
                              {row?.description && (
                                <div className="text-xs opacity-70 mt-1 w-full">
                                  <div className="break-words" dangerouslySetInnerHTML={{ __html: linkify(row?.description) }}></div>
                                </div>
                              )}
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {messageJson?.footer?.text && (
              <div className="text-xs opacity-70 mt-2 italic">
                <div dangerouslySetInnerHTML={{ __html: linkify(messageJson?.footer?.text) }}></div>
              </div>
            )}
          </div>
        );

      case 'product':
        const productDetailsArr = messageJson?.product_details || [];
        const firstDetail = productDetailsArr[0];
        const items = firstDetail?.product_items || [];
        const featuredId = messageJson?.action?.product_retailer_id;
        const product = items.find((item: any) => item.retailer_id === featuredId) || items[0];

        return (
          <div className="flex flex-col gap-2 max-w-[280px]">
            {messageJson.header && renderHeader(messageJson.header)}

            {product && (
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all hover:shadow-md">
                {product.image_url && (
                  <div className="aspect-square relative overflow-hidden bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                    <ImageWithFallback
                      src={product.image_url}
                      alt={product.name}
                    />
                  </div>
                )}
                <div className="p-3 space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm leading-tight text-gray-900 dark:text-gray-100 line-clamp-1">{product.name}</h3>
                    <span className="shrink-0 font-bold text-sm">{product.price}</span>
                  </div>
                  {product.description && (
                    <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">{product.description}</p>
                  )}
                </div>
              </div>
            )}

            <div className="px-1 space-y-1 mt-1">
              {messageJson.body?.text && (
                <div
                  className="text-sm text-inherit leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: linkify(messageJson?.body?.text) }}
                ></div>
              )}

              {messageJson.footer?.text && (
                <div
                  className="text-[10px] opacity-70 italic"
                  dangerouslySetInnerHTML={{ __html: linkify(messageJson?.footer?.text) }}
                ></div>
              )}
            </div>

            {firstDetail?.text && (
              <button
                className="btn btn-sm btn-outline w-full rounded-lg normal-case font-semibold mt-1 h-9 min-h-[36px] border-current text-inherit"
                onClick={(e) => {
                  e.stopPropagation();
                  sendMessageToHello?.(firstDetail.text)
                }}
              >
                {firstDetail.text}
              </button>
            )}
          </div>
        );

      case 'location_request':
        const locRequest = messageJson.actions?.location_request || messageJson.action?.location_request;
        return (
          <div className="flex flex-col gap-1">
            {messageJson.header && renderHeader(messageJson.header)}

            {messageJson.body?.text && (
              <div className="mb-1">
                <div dangerouslySetInnerHTML={{ __html: linkify(messageJson.body.text) }}></div>
              </div>
            )}

            {locRequest && (
              <button
                className="btn btn-sm btn-outline w-fit rounded-md normal-case justify-start px-4 font-medium text-inherit border-current flex items-center gap-2 mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  sendMessageToHello?.(locRequest.text_to_show || locRequest.text || "Share Location")
                }}
              >
                <MapPin size={16} strokeWidth={2} />
                {locRequest.text_to_show || locRequest.text || "Share Location"}
              </button>
            )}

            {messageJson.footer?.text && (
              <div className="text-xs opacity-70 mt-1">
                <div dangerouslySetInnerHTML={{ __html: linkify(messageJson.footer.text) }}></div>
              </div>
            )}
          </div>
        );

      default:
        return <div className="bg-inherit rounded-md text-inherit">Unsupported Message Type</div>;
    }
  };

  return (
    <div className="interactive-message">
      {renderInteractiveContent()}
    </div>
  );
}

export default RenderHelloInteractiveMessage;