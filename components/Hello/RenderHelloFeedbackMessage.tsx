import { submitFeedback } from '@/config/helloApi';
import { addUrlDataHoc } from '@/hoc/addUrlDataHoc';
import { $ReduxCoreType } from '@/types/reduxCore';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import React, { useCallback, useMemo, useState } from 'react';

function addDynamicValuesInText(text: string, dynamic_values: Record<string, string>): string {
  if (!text || !dynamic_values) return text;

  return text.replace(/##(\w+)##/g, (match, key) => {
    return dynamic_values[key] || match;
  });
}

function RenderHelloFeedbackMessage({ message, chatSessionId }: { message: any, chatSessionId: string }) {
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { widgetLogo, feedBackHeaderText } = useCustomSelector((state: $ReduxCoreType) => ({
    widgetLogo: state?.Hello?.[chatSessionId]?.widgetInfo?.logo?.path,
    feedBackHeaderText: addDynamicValuesInText(state.Hello?.[chatSessionId]?.widgetInfo?.feedback_text, message?.dynamic_values)
  }))

  const handleSubmitFeedback = useCallback(async () => {
    if (!selectedRating) return;

    setIsSubmitting(true);
    try {
      await submitFeedback({
        feedbackMsg: feedbackText,
        rating: selectedRating,
        token: message?.token || "",
        id: message?.id || 0
      });
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [feedbackText, selectedRating, message]);

  const handleRatingSelect = useCallback((rating) => () => {
    setSelectedRating(rating);
  }, []);

  const emojiMap = useMemo(() => ({
    terrible: "😡",
    bad: "😕",
    ok: "😐",
    good: "🙂",
    amazing: "😄"
  }), []);

  const ratingOptions = useMemo(() =>
    ["terrible", "bad", "ok", "good", "amazing"],
    []);

  return (
    <div className="py-4 px-2" style={{ maxWidth: '400px' }}>
      {widgetLogo && (
        <div className="flex justify-center mb-3">
          <img
            src={widgetLogo}
            alt="Widget Logo"
            className="max-w-full h-auto rounded-lg shadow-sm"
            style={{ maxHeight: '80px' }}
          />
        </div>
      )}
      {feedbackSubmitted ? (
        <div className="text-center py-3">
          <div className="mb-3">
            <div className="w-12 h-12 mx-auto mb-2 bg-success/10 rounded-full flex items-center justify-center border border-success/20">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-medium text-lg mb-2 text-base-content">Thank you for your feedback!</h3>
            <div className="mb-2">
              <span className="text-3xl">{emojiMap[selectedRating as keyof typeof emojiMap]}</span>
            </div>
          </div>
          {feedbackText && (
            <div className="mt-3 p-3 rounded-lg border border-base-300 text-left">
              <h4 className="text-sm font-medium mb-1 text-base-content">Your message:</h4>
              <p className="text-sm text-base-content/80">{feedbackText}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {feedBackHeaderText && (
            <div
              className="text-center font-medium"
              dangerouslySetInnerHTML={{ __html: feedBackHeaderText }}
            />
          )}


          <div className="space-y-3">
            <div className="text-center">
              <div className="flex justify-center gap-2">
                {ratingOptions.map(rating => (
                  <div
                    key={rating}
                    className={`
                      cursor-pointer transition-all duration-150 ease-in-out p-2 rounded-lg
                      ${selectedRating === rating
                        ? "bg-primary/10 border border-primary"
                        : "hover:bg-base-200 border border-transparent"
                      }
                    `}
                    onClick={(e) => { e.stopPropagation(); handleRatingSelect(rating)() }}
                  >
                    <span role="img" aria-label={rating} className="text-3xl block">
                      {emojiMap[rating as keyof typeof emojiMap]}
                    </span>
                  </div>
                ))}
              </div>
              {selectedRating && (
                <p className="text-xs text-primary font-medium mt-1 capitalize">
                  {selectedRating}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <textarea
                className="w-full p-3 rounded-lg border-2 border-base-300 bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200 resize-none"
                rows={3}
                placeholder="Enter you feedback here"
                value={feedbackText}
                onClick={(e) => { e.stopPropagation() }}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
            </div>

            <div className="flex flex-col items-center gap-1">
              {!selectedRating && (
                <p className="text-xs text-base-content/60">
                  Please select a rating to continue
                </p>
              )}
              <button
                className={`
                  px-5 py-2 rounded-md font-medium transition-colors duration-150 min-w-[120px]
                  ${!selectedRating
                    ? "bg-base-300 text-base-content/50 cursor-not-allowed"
                    : isSubmitting
                      ? "bg-primary text-primary-content"
                      : "bg-primary text-primary-content hover:bg-primary-focus"
                  }
                `}
                disabled={isSubmitting || !selectedRating}
                onClick={handleSubmitFeedback}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(addUrlDataHoc(RenderHelloFeedbackMessage));