"use client";
import { resolveAction } from "@/utils/templateEngine";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { useState } from "react";

export default function ButtonComponent({
  label = "Button",
  variant = "primary",
  size = "sm",
  disabled = false,
  loading = false,
  actionRef,
  actionDefs,
  scope,
  onClickAction,
  payload,
  className = "",
  style,
  onAction,
}) {
  const isChatLoading = useCustomSelector((state) => state.Chat.loading || false);
  const [clicked, setClicked] = useState(false);

  const isReplyType = (() => {
    if (actionRef) return true;
    if (!onClickAction) return false;
    const resolvedAction = typeof onClickAction.type === "object" && onClickAction.type !== null
      ? onClickAction.type
      : onClickAction;
    const t = typeof resolvedAction.type === "string" ? resolvedAction.type.trim().toLowerCase() : "";
    return t === "reply";
  })();

  const isReplyBlocked = isReplyType && isChatLoading;
  const safeStyle = style && typeof style === "object" ? style : {};
  const sizeMap = { xs: "btn-xs", sm: "btn-sm", md: "", lg: "btn-lg" };
  const variantMap = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    accent: "btn-accent",
    ghost: "btn-ghost",
    outline: "btn-outline",
    error: "btn-error",
    warning: "btn-warning",
    success: "btn-success",
    neutral: "btn-neutral",
  };

  const handleClick = async () => {
    if (disabled || loading || isReplyBlocked) return;
    // ── Declarative actionRef path ───────────────────────────────────────
    if (actionRef) {
      const resolved = resolveAction(actionRef, actionDefs, scope ?? {});
      if (!resolved) return;

      const resolvedType = typeof resolved.type === "string" ? resolved.type.trim().toLowerCase() : "";

      switch (resolvedType) {
        case "reply":
          setClicked(true);
          onAction?.({ type: "reply", text: resolved.text ?? resolved.value ?? label, data: resolved.data });
          return;

        case "event":
          onAction?.({
            type: "event",
            name: resolved.name,
            target: resolved.target,
            payload: resolved.payload ?? {},
          });
          // Also forward to parent window for embed contexts
          if (typeof window !== "undefined") {
            window.parent?.postMessage(
              {
                type: "CHATBOT_ACTION",
                name: resolved.name,
                target: resolved.target,
                payload: resolved.payload ?? {},
              },
              "*"
            );
          }
          return;

        default:
          if (resolvedType) {
            console.warn("[ButtonComponent] Unknown resolved action type:", resolved.type);
          }
          return;
      }
    }

    // ── Legacy inline onClickAction path ─────────────────────────────────
    if (!onClickAction) {
      return;
    }

    // Handle case where onClickAction.type is itself an object (nested action definition)
    const resolvedAction = typeof onClickAction.type === "object" && onClickAction.type !== null
      ? onClickAction.type
      : onClickAction;

    // `payload` prop = node-level payload (sibling of onClickAction in the JSON tree)
    const { type: rawActionType, text: actionText, value: actionValue, data: actionData, ...actionPayload } = resolvedAction;
    const actionType = typeof rawActionType === "string" ? rawActionType.trim().toLowerCase() : "";

    switch (actionType) {
      case "reply":
        setClicked(true);
        onAction?.({ type: "reply", text: actionText ?? actionValue ?? label, data: actionData });
        break;

      case "senddatatofrontend":
      // treat "submit" as an alias for sendDataToFrontend
      case "submit":
        if (typeof window !== "undefined") {
          window.parent?.postMessage({ type: "CHATBOT_ACTION", payload: payload ?? actionPayload }, "*");
        }
        onAction?.({ type: "sendDataToFrontend", payload: payload ?? actionPayload });
        break;

      default:
        if (actionType) {
          console.warn("[ButtonComponent] Unknown onClickAction type:", rawActionType);
        }
    }
  };

  const fullWidthCls = className?.includes("w-full") ? "w-full" : "";
  const isEffectivelyDisabled = disabled || loading || isReplyBlocked;

  const button = (
    <button
      type="button"
      className={`
                btn ${variantMap[variant] ?? "btn-primary"} ${sizeMap[size] ?? "btn-sm"}
                ${loading ? "loading loading-spinner" : ""}
                ${isReplyBlocked ? "opacity-50 cursor-not-allowed" : ""}
                rounded-xl font-medium tracking-wide transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-current
                ${fullWidthCls}
                ${className}
            `}
      style={safeStyle}
      disabled={isEffectivelyDisabled}
      onClick={handleClick}
    >
      {!loading && label}
    </button>
  );

  if (isReplyType && clicked && isChatLoading) {
    return (
      <div className="tooltip tooltip-top" data-tip="Please wait for the response…">
        {button}
      </div>
    );
  }

  return button;
}
