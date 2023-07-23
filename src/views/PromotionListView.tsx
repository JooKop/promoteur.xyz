import { ReactElement } from "react";
import { useConversations } from "../hooks/useConversations";
import { useClient } from "../hooks/useClient";
import { Link } from "react-router-dom";
import { useLatestMessages } from "../hooks/useLatestMessages";
import PromotionCellView from "./PromotionCellView";

export default function PromotionListView({ promotions }): ReactElement {
  return (
    <div className="w-full">
      {promotions?.length == 0 && <p>No Promotions yet.</p>}
      {promotions
        ? promotions.map((promotion, i) => (
            <PromotionCellView promotion={promotion} />
          ))
        : "Could not load conversations"}
    </div>
  );
}
