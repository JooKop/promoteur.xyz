
# <img src="./public/megaphone.png" height="60" valign="middle" alt="Gasdrop" /> Promoteur
## Introduction
Promoteur is a Web3 promotion tool that was developed during the ETHGlobal Paris hackathon. It utilizes various Web3 technologies, such as [Airstack](https://www.airstack.xyz/) and [XMTP](https://xmtp.org/) to provide targeted marketing based on NFT and POAP ownership. The possibilities are limitless and the tool will be expanded rapidly in the near future.

<img src="./example.png"/>

## How does it work
1. Login with your wallet.
2. Create a new promotion. Filter XMTP users based on their NFT and POAP ownership.
3. Send a message with a customized link to any number of wallets that pass the filter.
4. The recipients will receive the XMTP message together with a link, if provided.
5. You can view on the Promoteur dashboard how many people clicked the link.

## Technical details
Frontend built with React, utilizing the [XMTP JavaScript SDK](https://github.com/xmtp/xmtp-js) playground and the [Airstack Web SDK](https://github.com/Airstack-xyz/airstack-web-sdk). 

Backend built with Python (Flask), Docker and PostgreSQL.

Everything can be run locally using the instructions below.

## Install the frontend package
```bash
npm  install
```

## Run the frontend server
```bash
npm  run  dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to access the Promoteur website.

## Run the backend server
First install all required python packages:
```bash
pip3 install -r requirements.txt
```
Then start the database. The script will run PostgreSQL 15 in a docker container.
```bash
./scripts/dbrun.sh
```
Init the database tables:
```bash
python3 scripts/dbinit.py
```
Run the backend server:
```bash
python3 backend/server.py
```
Your backend should now be up and running and ready to communicate with the frontend.