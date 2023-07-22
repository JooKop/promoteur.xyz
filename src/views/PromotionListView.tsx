import { ReactElement } from "react";
import { useConversations } from "../hooks/useConversations";
import { useClient } from "../hooks/useClient";
import { Link } from "react-router-dom";
import { useLatestMessages } from "../hooks/useLatestMessages";
import PromotionCellView from "./PromotionCellView";

export default function PromotionListView({ promotions }): ReactElement {
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
