import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { PropsWithChildren, ReactElement, useEffect, useState } from "react";
import {
  configureChains,
  createClient,
  WagmiConfig,
  useSigner,
  useAccount,
  useDisconnect,
} from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { useSetClient } from "../hooks/useClient";
import { Client } from "@xmtp/xmtp-js";
import Header from "../Views/Header";
import Footer from "../Views/Footer";

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "XMTP Inbox",
  chains,
});

const wagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider,
  webSocketProvider,
});

function WalletSetter({
  setWaitingForSignatures,
  children,
}: PropsWithChildren<{
  setWaitingForSignatures: (state: boolean) => void;
}>): ReactElement {
  const { disconnect } = useDisconnect();
  const { data: signer } = useSigner({
    onError: () => {
      setWaitingForSignatures(false);
      disconnect();
    },
  });
  const setClient = useSetClient();

  useEffect(() => {
    if (signer) {
      setWaitingForSignatures(true);
      (async () => {
        try {
          const client = await Client.create(signer, {
            env: "production",
          });
          client.enableGroupChat();

          setClient(client);
          setWaitingForSignatures(false);
        } catch {
          disconnect();
          setWaitingForSignatures(false);
        }
      })();
    }
  }, [!!signer]);

  return <>{children}</>;
}

export default function WalletContext({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  const [waitingForSignatures, setWaitingForSignatures] = useState(false);

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <WalletSetter setWaitingForSignatures={setWaitingForSignatures}>
          {waitingForSignatures ? (
            <div className="w-full px-4 py-5 sm:p-6 content-center flex flex-col">
              <Header />
              <p className="pt-8 opacity-50 text-3xl mb-2 text-center">
                Waiting for signatures...
              </p>
              <Footer />
            </div>
          ) : (
            children
          )}
        </WalletSetter>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
