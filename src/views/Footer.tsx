export default function Footer(): ReactElement {
  return (
    <div className="mt-10 flex flex-row justify-center">
      <div className="flex flex-col justify-center">
        <p className="pb-2 border-b-2 text-center font-sans opacity-50 text-3xl">
          Powered by
        </p>
        <div className="mt-2 flex flex-row justify-center">
          <img className="opacity-50 w-32" src="airstack.png" />
          <img className="ml-4 opacity-50 w-32" src="xmtp.svg" />
        </div>
      </div>
    </div>
  );
}
