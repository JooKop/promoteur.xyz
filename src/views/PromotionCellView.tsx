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
    <div className="mt-2 pr-4 pl-4 p-2 bg-white rounded-lg flex flex-row justify-between">
      <div className="flex flex-row justify-center items-center">
        <span className="text-blue-700 dark:text-blue-500">
          {promotion.name}
        </span>
      </div>
      <div className="flex flex-row justify-end">
        <div className="flex flex-col items-center">
          <img className="w-6 mr-2" src="envelope.png" />
          <span className="text-sm text-blue-700 dark:text-blue-500">
            {promotion.recipients}{" "}
            {promotion.recipients > 1 ? "recipients" : "recipient"}
          </span>
        </div>
        <div className="ml-10 flex flex-col items-center">
          <img className="w-6 mr-2" src="cursor.png" />
          <span className="text-sm text-blue-700 dark:text-blue-500">
            {promotion.clicks} {promotion.clicks > 1 ? "clicks" : "click"}
          </span>
        </div>
      </div>
    </div>
  );
}
