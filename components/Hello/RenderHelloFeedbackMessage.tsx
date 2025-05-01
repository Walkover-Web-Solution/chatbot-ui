import { submitFeedback } from '@/config/helloApi'
import { $ReduxCoreType } from '@/types/reduxCore';
import { useCustomSelector } from '@/utils/deepCheckSelector';
import React, { useState, useCallback, useMemo } from 'react'

function RenderHelloFeedbackMessage({message}:{message:any}) {
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const {widgetLogo} = useCustomSelector((state:$ReduxCoreType)=>({
    widgetLogo: state?.Hello?.widgetInfo?.logo?.path
  }))
  const helloConfig = useCustomSelector((state:$ReduxCoreType)=>state?.Hello?.helloConfig)
  const handleSubmitFeedback = useCallback(async () => {
    if (!selectedRating) return;
    
    setIsSubmitting(true);
    try {
      await submitFeedback({
        feedbackMsg: feedbackText,
        rating: selectedRating,
        token: message?.token || "",
        id: message?.id || 0,
        helloConfig
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
    <div className="p-3 bg-base-200 rounded-lg" style={{maxWidth: '400px'}}>
      {widgetLogo && (
        <div className="flex justify-center mb-3">
          <img 
          src={widgetLogo} 
          alt="Widget Logo" 
          className="max-w-full h-auto rounded-md"
          style={{ maxHeight: '200px' }}
          />
        </div>
      )}
      {feedbackSubmitted ? (
        <div className="text-center">
          <h3 className="font-medium text-lg mb-2">Thanks for your feedback</h3>
          <div className="mb-2">
            <span className="text-4xl">{emojiMap[selectedRating as keyof typeof emojiMap]}</span>
          </div>
          {feedbackText && (
            <div className="mt-2 p-2 rounded text-left">
              <h4 className="text-sm font-medium mb-1">Your feedback message:</h4>
              <p className="text-sm">{feedbackText}</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex gap-4 justify-center mb-3">
            {ratingOptions.map(rating => (
              <div 
                key={rating}
                className={`flex flex-col items-center cursor-pointer hover:opacity-80 ${selectedRating === rating ? "scale-110" : ""}`}
                onClick={handleRatingSelect(rating)}
              >
                <span role="img" aria-label={rating} className="text-3xl">{emojiMap[rating as keyof typeof emojiMap]}</span>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <textarea 
              className="w-full p-2 rounded border border-base-300 bg-base-100" 
              rows={3}
              placeholder="Share your feedback..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
          </div>
          <div className="mt-2 flex justify-center">
            <button 
              className="btn btn-primary btn-sm"
              disabled={isSubmitting || !selectedRating}
              onClick={handleSubmitFeedback}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                "Submit Feedback"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default React.memo(RenderHelloFeedbackMessage);