# Stock Trading Simulator

Web application that allows you to simulate trades in the stock market without
using any real money.

## Dependencies:
1. Next.js - `npm install next`
2. React.js - `npm install react`
3. react-dom - `npm install react-dom`

Run all these commands at once with `npm install next react react-dom`

## To run this project locally you will need:

1. MongoDB either through the cloud with [Atlas](https://www.mongodb.com/atlas/database) or locally (preferably along with [Compass](https://www.mongodb.com/products/compass))
2. A TD Ameritrade [developer](https://developer.tdameritrade.com/) account
    - After signing up, you need to get your [User Principal Details](https://developer.tdameritrade.com/user-principal/apis/get/userprincipals-0) manually.
        **I plan to make this a process that can be done programmatically, but for now:**
        - Enter `streamerSubscriptionKeys,streamerConnectionInfo` into the fields parameter
        - Click on the **OAuth 2.0** Button and authenticate with your TD Ameritrade account.
        - Click *Send*, and copy the JSON from the *Response* section, making sure that `streamerSubscriptionKeys` is part of the response.
        - Paste this json in a file named `userprincipal.json` in the **pages/api** folder inside the *client* folder.

Once everything is set up open two terminals, one for each the client and server programs.

### Run the server
Assuming you start at the root of the project:
1. `cd server`
2. `npm install`
3. `node server.js`
4. The server will be used to respond to various requests in the client-side

### Run the client
In the other terminal instance,
1. `cd client`
2. `npm install`
3. `npm run dev` OR `npm run build; npm run start` for a production build.
4. Open a browser and head to *http://localhost:3000*