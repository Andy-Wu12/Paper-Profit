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
    - After signing up, you need to get your [User Principal Details](https://developer.tdameritrade.com/user-principal/apis/get/userprincipals-0) manually (everyday).
        **I plan to make this a process that can be done programmatically, but for now:**
        - Enter `streamerSubscriptionKeys,streamerConnectionInfo` into the fields parameter
        - Click on the **OAuth 2.0** Button and authenticate with your TD Ameritrade account.
        - Click *Send*, and copy the JSON from the *Response* section, making sure that `streamerSubscriptionKeys` is part of the response.
        - Paste this json in a file named `userprincipal.json` in the **pages/api** folder inside the **client** directory.
3. A RapidAPI account
    1. Create an app by clicking *My Apps* then *Add New App*
    2. Enter a name of your choosing then click **Save**.
    3. Under the **My Apps** section, click on the name of your app.
    4. Click *Security* then the eye icon to reveal your Application key
    5. Copy that key into a **.env** file in the **server** folder, with the key name *RAPID_API_YAHOO_KEY*
    6. Subscribe to the [YFINANCE](https://rapidapi.com/asepscareer/api/yfinance-stock-market-data/) API
4. `.env` file for **server**
    1. `FRONTEND_BASE_URL="http://localhost:3000"` or whatever port your frontend is running on.
    2. `RAPID_API_YAHOO_KEY=[insert your api key here]`
5. `.env.local` for **client**
    1. `NEXT_PUBLIC_API_BASE_URL="http://localhost:3011"` or whatever port your backend is running on.

Once everything is set up open two terminals, one each for both the client and server programs.

### Run the server
Assuming you start at the root of the project:
1. `cd server`
2. `npm install`
3. `npm run start`
4. The server will be used to respond to various requests in the client-side
5. You can see the various endpoints set up by accessing the index at *http://localhost:3011*

### Run the client
In the other terminal instance,
1. `cd client`
2. `npm install`
3. `npm run dev` OR `npm run deploy` for a production build.
4. Open a browser and head to *http://localhost:3000*
