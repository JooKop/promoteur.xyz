import LoginView from "./views/LoginView";
import { useClient } from "./hooks/useClient";
import PromoteurView from "./views/PromoteurView";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";

TimeAgo.addDefaultLocale(en);

function App() {
  const client = useClient();
  return client ? <PromoteurView /> : <LoginView />;
}

export default App;
