set MongoAddress="C:\Program Files\MongoDB\Server\3.2\bin"
set NodeJsServerAddress= "E:\Nir\Markeasy\markeasyApp"

cd /d %MongoAddress%
echo Starting mongo server on %cd%
start mongod
start mongo

cd /d %NodeJsServerAddress%
echo Starting Node server on %cd%
start node server.js

start "" http://localhost:3000/