import { ReactElement } from "react";
import { Conversation, Message } from "../model/db";
import { shortAddress } from "../util/shortAddress";
import ReactTimeAgo from "react-time-ago";
import { MessageContent } from "./MessageCellView";

export default function PromotionCellView({
  promotion,
}: {
  promotion: any;
}): ReactElement {
  return (
    <div className="mt-2 p-2 border dark:border-zinc-600 rounded">
      <div className="flex items-center justify-between space-x-2">
        <div className="hover:underline">
          <span className="text-blue-700 dark:text-blue-500">
            {promotion.name}
          </span>{" "}
        </div>
        <div className="text-xs text-zinc-500">
          Recipients: {promotion.recipients}
        </div>
        <div className="text-xs text-zinc-500">Clicks: {promotion.clicks}</div>
      </div>
    </div>
  );
}
