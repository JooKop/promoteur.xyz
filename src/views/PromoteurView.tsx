import { ReactElement, useState, useEffect } from "react";
import ConversationListView from "./ConversationListView";
import PromotionListView from "./PromotionListView";
import { useConversations } from "../hooks/useConversations";
import { useClient, useSetClient } from "../hooks/useClient";
import { shortAddress } from "../util/shortAddress";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { useDisconnect } from "wagmi";
import Button from "@mui/material/Button";
import Modal from "react-modal";
import { fetchQuery } from "@airstack/airstack-react";
import { sendMessage } from "../model/messages";
import { startConversation } from "../model/conversations";
import { ContentTypeText } from "@xmtp/xmtp-js";
import uuid from "react-uuid";

import { init, useLazyQuery } from "@airstack/airstack-react";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    width: 600,
  },
};

const nftQuery = `
query TokenHoldersAndImages {
  TokenNfts(
    input: {filter: {address: {_eq: "$ADDRESS"}}, blockchain: ethereum, limit: 200}
  ) {
    TokenNft {
      tokenBalances {
        owner {
          addresses
        }
      }
    }
  }
}
`;
//0x88b40592ce79a76eb14fec1ef9d21fbefcd9dffa
const xmtpEnabledQuery = `
query BulkFetchPrimaryENSandXMTP($address: [Identity!]) {
  XMTPs(input: {blockchain: ALL, limit: 200, filter: {owner: {_in: $address}}}) {
    XMTP {
      isXMTPEnabled
      owner {
        addresses
        primaryDomain {
          name
        }
      }
    }
  }
}
`;

export default function PromoteurView(): ReactElement {
  const client = useClient()!;
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [sendingModalOpen, setSendingModalOpen] = useState(false);
  const [checkedAccounts, setCheckedAccounts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [searchAddress, setSearchAddress] = useState("");
  const [promotionMessage, setPromotionMessage] = useState("");
  const [promotionLink, setPromotionLink] = useState("");
  const [promotionName, setPromotionName] = useState("");
  const [promotions, setPromotions] = useState([]);
  const [promotionsLoaded, setPromotionsLoaded] = useState(false);

  const getPromotionList = () => {
    // Fetch all promotions
    fetch("http://localhost:5050/promotions")
      .then((response) => response.json())
      .then((data) => setPromotions(data));
  };

  if (!promotionsLoaded) {
    getPromotionList();
    setPromotionsLoaded(true);
  }

  //Airstack
  init("8ff50c9197574148b92d2b0b44c9cd9e");
  const variables = {};

  function copy() {
    navigator.clipboard.writeText(client.address);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  const createPromotion = (uid, name, recipients, link) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: uid,
        name: name,
        recipients: recipients,
        link: link,
      }),
    };
    fetch("http://localhost:5050/new", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log("returned: " + data.success);
        getPromotionList();
      });
  };

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sendMessages = async (uid) => {
    checkedAccounts.forEach(async (account) => {
      const conversation = await startConversation(client, account);
      console.log("Convo: " + conversation);
      console.log("Sending message to " + account);
      console.log(
        "Starting conversation with " +
          conversation.id?.toString() +
          ", " +
          conversation.topic +
          ", " +
          conversation.title
      );
      await sendMessage(
        client,
        conversation,
        promotionMessage.replace("$link", "http://localhost:5050/go/" + uid),
        ContentTypeText
      );
    });
  };

  // Add/Remove checked item from list
  const handleCheckedAccounts = (event: any) => {
    var updatedList = [...checkedAccounts];
    if (event.target.checked) {
      updatedList = [...checkedAccounts, event.target.value];
    } else {
      updatedList.splice(checkedAccounts.indexOf(event.target.value), 1);
    }
    setCheckedAccounts(updatedList);
  };

  const handleSearch = async (event: any) => {
    const { data, error } = await fetchQuery(
      nftQuery.replace("$ADDRESS", searchAddress)
    );
    let accountList = [];
    let xmtpVariables = {};
    if (data != null) {
      //Data has been retrieved. Fill accounts.
      const userList = data.TokenNfts?.TokenNft;

      if (userList?.length > 0) {
        accountList = userList.map((user: any) => {
          return user.tokenBalances[0].owner.addresses[0];
        });
        //Now figure out which of these have xmtp enabled
        const xmtpVariables = { address: accountList };
        console.log("Lengthi: " + accountList.length);
        const { data, error } = await fetchQuery(
          xmtpEnabledQuery,
          xmtpVariables
        );

        const xmtpList = data.XMTPs?.XMTP;

        if (xmtpList.length > 0) {
          const accountList = xmtpList.map((user: any) => {
            return user.owner.addresses[0];
          });
          setAccounts(accountList);
        }
      } else {
        setAccounts([]);
      }
    }
  };

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
            <Button variant="contained" onClick={getPromotionList}>
              Refresh
            </Button>
            <PromotionListView promotions={promotions} />
            <Button onClick={setModalOpen} variant="contained">
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
          <input
            onChange={(e) => setPromotionName(e.target.value)}
            className="border-2 border-black text-black p-2"
          ></input>
          <p className="text-black">Targeting:</p>
          <div className="flex flex-row">
            <label className="text-black">
              <input className="mr-1" type="radio" name="filter" value="nft" />
              NFT
            </label>
            <label className="text-black">
              <input
                className="ml-4 mr-1"
                type="radio"
                name="filter"
                value="poap"
              />
              POAP
            </label>
          </div>
          <p className="text-black">Address:</p>
          <input
            onChange={(e) => setSearchAddress(e.target.value)}
            className="border-2 border-black text-black p-2"
          ></input>
          <Button className="mt-2" variant="contained" onClick={handleSearch}>
            Search
          </Button>

          <p className="text-black">
            List of accounts with XMTP enabled ({accounts.length}x):
          </p>
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
                        onChange={handleCheckedAccounts}
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
            onChange={(e) => setPromotionMessage(e.target.value)}
            className="w-64 h-32 border-2 border-black text-black p-2"
          ></textarea>
          <p className="text-black">Promotion link:</p>
          <input
            id="promotionLink"
            onChange={(e) => setPromotionLink(e.target.value)}
            className="border-2 border-black text-black p-2"
          ></input>
          <div className="flex flex-row mt-4 justify-between">
            <Button
              variant="contained"
              onClick={() => {
                const uid = uuid();
                setModalOpen(false);
                setSendingModalOpen(true);
                createPromotion(
                  uid,
                  promotionName,
                  checkedAccounts.length,
                  promotionLink
                );
                sendMessages(uid);
              }}
            >
              Create Promotion
            </Button>
            <Button variant="outlined" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        shouldCloseOnOverlayClick={false}
        isOpen={sendingModalOpen}
        onRequestClose={() => setModalOpen(false)}
        style={customStyles}
      >
        <div className="flex flex-col text-black">
          <p>Sending promotion to:</p>
          <p>
            {checkedAccounts.map((account, i) => {
              return <p>{account}</p>;
            })}
          </p>
          <Button
            variant="contained"
            onClick={() => {
              setSendingModalOpen(false);
              setCheckedAccounts([]);
            }}
          >
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}
