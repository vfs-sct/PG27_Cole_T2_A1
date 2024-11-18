@ECHO off

CALL npm init -y

CALL npm install express cors

CALL npm install --save-dev nodemon

ECHO {"name": "backend","version": "1.0.0","main": "server.js","scripts": {"start": "nodemon server.js"},"keywords": [],"author": "","license": "ISC","description": "","dependencies": {"cors": "^2.8.5","express": "^4.21.1"},"devDependencies": {"nodemon": "^3.1.7"}} > package.json

:: creates the server.js file 
ECHO const express = require("express"); const cors = require("cors");>server.js

CALL npm start

ECHO "Server creation completed"

pause