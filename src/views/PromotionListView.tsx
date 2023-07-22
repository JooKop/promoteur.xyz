import { ReactElement } from "react";
import { useConversations } from "../hooks/useConversations";
import { useClient } from "../hooks/useClient";
import { Link } from "react-router-dom";
import { useLatestMessages } from "../hooks/useLatestMessages";
import PromotionCellView from "./PromotionCellView";

const promotions = [
  { id: 1, name: "Promotion 1", recipients: 3, replies: 1, clicks: 2 },
  { id: 2, name: "Promotion 2", recipients: 5, replies: 2, clicks: 1 },
  { id: 3, name: "Promotion 3", recipients: 1, replies: 0, clicks: 0 },
];

export default function PromotionListView(): ReactElement {
  // const client = useClient();
  // const conversations = useConversations(client);
  // const latestMesssages = useLatestMessages(conversations);

  return (
    <div>
      {promotions?.length == 0 && <p>No Promotions yet.</p>}
      {promotions
        ? promotions.map((promotion, i) => (
            // <ConversationCellView
            //   conversation={conversation}
            //   latestMessage={latestMesssages[i]}
            // />
            <PromotionCellView promotion={promotion} />
          ))
        : "Could not load conversations"}
    </div>
  );
}
