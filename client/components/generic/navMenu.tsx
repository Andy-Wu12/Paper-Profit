import {
  ShowLastSearchButton, 
  ShowHoldingsButton, 
  WatchListButton, 
  ResetAccountButton
} from "./navActionButtons";

import type { setterPropsProps } from "../../pages/dashboard";

type NavMenuProps = {
  setDashboardComponent: React.Dispatch<any>,
  lastSearch: string | null,
  websocket: WebSocket,
  setterProps: setterPropsProps
}

function NavMenu({setDashboardComponent, lastSearch, websocket, setterProps}: NavMenuProps): React.ReactElement {
  return (
    <nav>
      <ShowLastSearchButton setterProps={setterProps} setDashboardComponent={setDashboardComponent} websocket={websocket} lastSearch={lastSearch}/>
      <ShowHoldingsButton setDashboardComponent={setDashboardComponent} />
      <WatchListButton setDashboardComponent={setDashboardComponent} />
      <ResetAccountButton />
    </nav>
  );
}

export default NavMenu;