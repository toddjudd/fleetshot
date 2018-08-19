const mongoose = require('mongoose');
var https = require('https');
var http = require('http');
var path = require('path');
var port = process.argv[2] || 4747;
var insecurePort = process.argv[3] || 4040;
var fs = require('fs');
var checkip = require('check-ip-address');
// var server;
var insecureServer;
var options;
var certsPath = path.join(__dirname, 'certs', 'server');
var caCertsPath = path.join(__dirname, 'certs', 'ca');
 
//ssl cert
// options = {
//   key: fs.readFileSync(path.join(certsPath, 'fleetshot.key.pem'))
//   // This certificate should be a bundle containing your server certificate and any intermediates
//   // cat certs/cert.pem certs/chain.pem > certs/server-bundle.pem
// , ca: [
//     fs.readFileSync(path.join(caCertsPath, 'intermediate.crt.pem'))
//     ,fs.readFileSync(path.join(caCertsPath, 'root.crt.pem'))
//   ]
// , cert: fs.readFileSync(path.join(certsPath, 'fleetshot.crt.pem'))
//   // ca only needs to be specified for peer-certificates
// //, ca: [ fs.readFileSync(path.join(caCertsPath, 'my-root-ca.crt.pem')) ]
// , requestCert: false
// , rejectUnauthorized: true
// };

// Make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
	console.log(process.versions.node)
if (major < 7 || (major === 7 && minor <= 5)) {
  console.log('🛑 🌮 🐶 💪 💩\nHey You! \n\t ya you! \n\t\tBuster! \n\tYou\'re on an older version of node that doesn\'t support the latest and greatest things we are learning (Async + Await)! Please go to nodejs.org and download version 7.6 or greater. 👌\n ');
  process.exit();
}

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

// console.log(process.env)
// Connect to our Database and handle any bad connections
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${process.env.DATABASE} → ${err.message}`);
});

// READY?! Let's go!
require('./models/User.js');
require('./models/Bol.js');

// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});