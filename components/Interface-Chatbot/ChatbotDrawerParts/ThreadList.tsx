"use client";
import React from "react";
import { useComponentOverride } from "./useComponentOverride";

export interface ThreadListProps {
  subThreadList: any[];
  subThreadId?: string;
  onSelect: (subThreadId: string) => void;
}

const ThreadItem = ({
  thread,
  active,
  onSelect,
}: {
  thread: any;
  active: boolean;
  onSelect: (id: string) => void;
}) => {
  const Override = useComponentOverride([
    "sidebar",
    "body",
    "threadList",
    "item",
  ]);
  if (Override) return <Override thread={thread} active={active} onSelect={onSelect} />;

  return (
    <li>
      <a
        className={active ? "active" : ""}
        onClick={() => onSelect(thread?.sub_thread_id)}
        data-testid={`chatbot-drawer-thread-${thread?.sub_thread_id}`}
      >
        {thread?.display_name || thread?.sub_thread_id}
      </a>
    </li>
  );
};

const ThreadList = (props: ThreadListProps) => {
  const Override = useComponentOverride(["sidebar", "body", "threadList"]);
  if (Override) return <Override {...props} />;

  const { subThreadList, subThreadId, onSelect } = props;
  if (!subThreadList || subThreadList.length === 0) {
    return (
      <div className="flex justify-center items-center mt-5">
        <span>No Conversations</span>
      </div>
    );
  }

  return (
    <ul>
      {subThreadList.map((thread: any, index: number) => (
        <ThreadItem
          key={`${thread?._id ?? thread?.sub_thread_id}-${index}`}
          thread={thread}
          active={thread?.sub_thread_id === subThreadId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
};

export default ThreadList;
