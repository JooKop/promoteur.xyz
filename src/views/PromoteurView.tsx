import { ReactElement, useState } from "react";
import ConversationListView from "./ConversationListView";
import PromotionListView from "./PromotionListView";
import { useClient, useSetClient } from "../hooks/useClient";
import { shortAddress } from "../util/shortAddress";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { useDisconnect } from "wagmi";
import Button from "../components/Button";
import Modal from "react-modal";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    width: 400,
  },
};

const accounts = ["0x2352034923", "0x2334323423", "0x123456788"];

export default function PromoteurView(): ReactElement {
  const client = useClient()!;
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  function copy() {
    navigator.clipboard.writeText(client.address);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  const { disconnectAsync } = useDisconnect();
  const setClient = useSetClient();
  async function logout() {
    await disconnectAsync();
    indexedDB.deleteDatabase("DB");
    localStorage.removeItem("_insecurePrivateKey");
    setClient(null);
  }

  return (
    <div>
      <Header>
        <div className="flex justify-between">
          <h1 className="text-amber-400 text-3xl">Promoteur</h1>
          <div>
            Hi {shortAddress(client.address)}{" "}
            <button className="text-xs text-zinc-600" onClick={copy}>
              {copied ? "Copied Address!" : "Copy Address"}
            </button>
          </div>
          <div>
            <button onClick={logout}>Logout</button>
          </div>
        </div>
      </Header>

      <div className="p-4 pt-20">
        <div className="flex flex-row">
          <div className="border-r-2 p-4 pr-10 flex flex-col">
            <p className="underline">Promotions</p>
            <p className="underline">Analytics</p>
          </div>
          <div className="pl-10 flex flex-col">
            <small className="flex justify-between"></small>
            All promotions
            <PromotionListView />
            <Button onClick={setModalOpen} type="button">
              New Promotion
            </Button>
          </div>
        </div>
      </div>

      <Modal
        shouldCloseOnOverlayClick={false}
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        style={customStyles}
      >
        <div className="flex flex-col">
          <p className="text-black">Name:</p>
          <input className="border-2 border-black text-black p-2"></input>
          <p className="text-black">Filter:</p>
          <label className="text-black">
            <input type="radio" name="filter" value="nft" />
            NFT
          </label>
          <label className="text-black">
            <input type="radio" name="filter" value="poap" />
            POAP
          </label>
          <p className="text-black">Address:</p>
          <input className="border-2 border-black text-black p-2"></input>
          <Button className="mt-2" type="button">
            Search
          </Button>
          <p className="text-black">List of accounts:</p>
          <div className="border-2 h-32 overflow-y-auto">
            <ul>
              {accounts
                ? accounts.map((account, i) => (
                    <li className="text-black">
                      <input
                        key={i}
                        type="checkbox"
                        name="account"
                        value={account}
                      />{" "}
                      {account}
                    </li>
                  ))
                : "No accounts found"}
            </ul>
          </div>
          <p className="text-black">Promotion message:</p>
          <textarea
            name="description"
            className="w-64 h-32 border-2 border-black text-black p-2"
          ></textarea>
          <p className="text-black">Promotion link:</p>
          <input className="border-2 border-black text-black p-2"></input>

          <Button className="mt-4" type="button">
            Create Promotion
          </Button>
          <Button
            className="mt-4"
            type="button"
            onClick={() => setModalOpen(false)}
          >
            Close Modal
          </Button>
        </div>
      </Modal>
    </div>
  );
}
