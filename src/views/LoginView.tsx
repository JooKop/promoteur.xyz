import { ReactElement, useEffect } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function LoginView(): ReactElement {
  return (
    <div className="w-full px-4 py-5 sm:p-6 content-center">
      <h1 className="text-amber-400 text-3xl">Promoteur</h1>
      <div className="mt-3">
        <div className="connect-button">
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}
