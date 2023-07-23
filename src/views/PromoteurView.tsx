import { ReactElement, useState, useEffect } from "react";
import ConversationListView from "./ConversationListView";
import PromotionListView from "./PromotionListView";
import { useConversations } from "../hooks/useConversations";
import { useClient, useSetClient } from "../hooks/useClient";
import { shortAddress } from "../util/shortAddress";
import { Link } from "react-router-dom";
import { useDisconnect } from "wagmi";
import Button from "@mui/material/Button";
import { LoadingButton } from "@mui/lab";
import Modal from "react-modal";
import { fetchQuery } from "@airstack/airstack-react";
import { sendMessage } from "../model/messages";
import { startConversation } from "../model/conversations";
import { ContentTypeText } from "@xmtp/xmtp-js";
import uuid from "react-uuid";
import Header from "./Header";
import Footer from "./Footer";

import { init, useLazyQuery } from "@airstack/airstack-react";

const customStyles = {
  content: {
    top: "40%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    borderRadius: "30px",
    width: 600,
  },
};

const nftQuery = `
query TokenHolders {
  TokenNfts(
    input: {filter: {address: {_eq: "$ADDRESS"}}, blockchain: ALL, limit: 200}
  ) {
    TokenNft {
      tokenBalances {
        owner {
          addresses
        }
      }
      metaData {
        name
      }
    }
  }
}
`;

const poapQuery = `
query POAPOwningAddresses {
  Poaps(input: {filter: {eventId: {_eq: "$eventId"}}, blockchain: ALL, limit: 200}) {
    Poap {
     owner {
      addresses
     }
     poapEvent{
      eventName
     }
    }
  }
}
`;

//0x88b40592ce79a76eb14fec1ef9d21fbefcd9dffa
//140955
const xmtpEnabledQuery = `
query FetchXMTPUsers($address: [Identity!]) {
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
  const [searchType, setSearchType] = useState("NFT");
  const [extraInfo, setExtraInfo] = useState("");
  const [searching, setSearching] = useState(false);

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

  init(import.meta.env.VITE_AIRSTACK_API_KEY);
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
    setSearching(true);
    let accountList = [];
    setAccounts(accountList);
    let xmtpVariables = {};
    if (searchType === "NFT") {
      const { data, error } = await fetchQuery(
        nftQuery.replace("$ADDRESS", searchAddress)
      );
      if (data != null) {
        //Data has been retrieved. Fill accounts.
        const userList = data.TokenNfts?.TokenNft;
        setExtraInfo("NFT: " + data.TokenNfts?.TokenNft[0].metaData.name);
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

          if (xmtpList?.length > 0) {
            const accountList = xmtpList.map((user: any) => {
              return user.owner.addresses[0];
            });
            setAccounts(accountList.sort());
          }
        } else {
          setAccounts([]);
        }
      }
    } else if (searchType === "POAP") {
      const { data, error } = await fetchQuery(
        poapQuery.replace("$eventId", searchAddress)
      );

      if (data != null) {
        //Data has been retrieved. Fill accounts.
        const userList = data.Poaps?.Poap;
        try {
          setExtraInfo("POAP: " + data.Poaps?.Poap[0].poapEvent.eventName);
        } catch (e) {
          console.log("error: " + e);
        }
        if (userList?.length > 0) {
          accountList = userList.map((user: any) => {
            return user.owner.addresses[0];
          });

          //Now figure out which of these have xmtp enabled
          const xmtpVariables = { address: accountList };
          console.log("Lengthi: " + accountList.length);
          const { data, error } = await fetchQuery(
            xmtpEnabledQuery,
            xmtpVariables
          );

          const xmtpList = data.XMTPs?.XMTP;

          if (xmtpList?.length > 0) {
            const accountList = xmtpList.map((user: any) => {
              return user.owner.addresses[0];
            });
            setAccounts(accountList.sort());
          }
        } else {
          setAccounts([]);
        }
      }
    }
    setSearching(false);
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
      <Header />
      <div className="flex flex-row justify-center p-4 pt-8">
        <div className="w-full flex flex-row justify-center">
          <div className="w-2/5 flex flex-col items-center">
            <p className="opacity-50 text-3xl mb-2 text-center">
              {promotions.length > 0
                ? "Your promotions"
                : "Create your first promotion!"}
            </p>
            <PromotionListView promotions={promotions} />
            <br />
            <div className="w-full flex flex-row justify-center">
              <Button onClick={setModalOpen} variant="contained">
                New Promotion
              </Button>
              <span className="w-2"> </span>
              {promotions.length > 0 && (
                <Button variant="contained" onClick={getPromotionList}>
                  Refresh
                </Button>
              )}
            </div>
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
          <div className="flex items-center">
            <span className="text-xl text-blue-700 dark:text-blue-500">
              Name
            </span>
            <input
              onChange={(e) => setPromotionName(e.target.value)}
              className="w-96 ml-5 border-2 rounded-lg border-4 text-black p-2"
            ></input>
          </div>
          <div className="mt-2 flex items-center">
            <span className="text-xl text-blue-700 dark:text-blue-500">
              Targeting
            </span>
            <label className="ml-5 text-xl text-black">
              <input
                onClick={() => setSearchType("NFT")}
                className="mr-1"
                type="radio"
                name="filter"
                value="nft"
              />
              NFT
            </label>
            <label className="text-xl text-black">
              <input
                onClick={() => setSearchType("POAP")}
                className="ml-4 mr-1"
                type="radio"
                name="filter"
                value="poap"
              />
              POAP
            </label>
          </div>
          <div className="mt-2">
            {searchType == "NFT" ? (
              <span className="text-xl text-blue-700 dark:text-blue-500">
                NFT Address
              </span>
            ) : (
              <span className="text-xl text-blue-700 dark:text-blue-500">
                POAP eventId
              </span>
            )}

            <input
              onChange={(e) => setSearchAddress(e.target.value)}
              className="ml-5 mr-5 border-2 border-4 text-black p-2"
            ></input>
            <LoadingButton
              className="mt-2 p-4"
              variant="contained"
              onClick={handleSearch}
              loading={searching!!}
              loadingPosition="end"
            >
              Search
            </LoadingButton>
          </div>
          <span className="text-center mt-2 text-lg text-white bg-indigo-500 rounded-lg bac">
            {extraInfo}
          </span>
          <span className="mt-2 text-xl text-blue-700 dark:text-blue-500">
            List of accounts with XMTP enabled ({accounts.length}x)
          </span>
          <div className="border-4 h-32 overflow-y-auto">
            <ul className="text-center">
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
          <span className="mt-2 text-xl text-blue-700 dark:text-blue-500">
            Promotion message
          </span>
          <textarea
            name="description"
            onChange={(e) => setPromotionMessage(e.target.value)}
            className="w-full h-32 border-4 text-black p-2"
          ></textarea>
          <span className="mt-2 text-xl text-blue-700 dark:text-blue-500">
            Promotion link
          </span>
          <input
            id="promotionLink"
            onChange={(e) => setPromotionLink(e.target.value)}
            className="border-4 text-black p-2"
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
            <Button
              variant="outlined"
              onClick={() => {
                setModalOpen(false);
                setCheckedAccounts([]);
                setAccounts([]);
                setExtraInfo("");
              }}
            >
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
          <span className="mb-5 text-center mt-2 text-xl text-blue-700 dark:text-blue-500">
            Promotion sent to the following accounts
          </span>
          <p className="text-center text-xl">
            {checkedAccounts.map((account, i) => {
              return <p>{account}</p>;
            })}
          </p>
          <span className="mt-5"></span>
          <Button
            variant="contained"
            onClick={() => {
              setSendingModalOpen(false);
              setCheckedAccounts([]);
              setAccounts([]);
              setExtraInfo("");
            }}
          >
            OK
          </Button>
        </div>
      </Modal>
      <Footer />
    </div>
  );
}
