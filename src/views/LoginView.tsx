import { ReactElement, useEffect } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Footer from "./Footer";
import Header from "./Header";

export default function LoginView(): ReactElement {
  return (
    <div className="w-full px-4 py-5 sm:p-6 content-center flex flex-col">
      <Header />
      <div className="mt-8 flex justify-center">
        <div className="connect-button">
          <ConnectButton />
        </div>
      </div>
      <Footer />
    </div>
  );
}
