var express = require( 'express' );
var app = express();
var fs = require('fs');
var helmet = require('helmet');
var https_opts = {
   key:  fs.readFileSync('/etc/letsencrypt/live/__HOST__.com/privkey.pem'),
   cert: fs.readFileSync('/etc/letsencrypt/live/__HOST__.com/cert.pem'),
   ca:   fs.readFileSync('/etc/letsencrypt/live/__HOST__.com/chain.pem'),
   requestCert: false,
   rejectUnauthorized: false

};
var https = require('https').createServer( https_opts, app);
var net = require( 'net' );
const listenport = 8080, defHost = 'www.darkstonemud.com', defPort = 5432;


app.use(helmet());
app.use( express.static(__dirname + '/public') );
https.listen( listenport,
      function()
      {
         console.log('listening on port ' + listenport );
      });

var io = require('socket.io').listen(https, {secure:true});
io.on( 'connection',
      function( socket )
      {
         let hostname = defHost, hostport = defPort;
         let query = socket.handshake.query;
         if( query.hostname != null )
            hostname = query.hostname;
         if( query.hostport != null )
            hostport = query.hostport;
         var client = net.createConnection( { host:hostname, port:hostport } );
         client.setEncoding( "latin1" );
         client.on( 'data',
               function( data )
               {
                  socket.emit( 'data', data.toString() );
               });

         client.on( 'close',
               function()
               {
                  socket.emit( 'status', { host: hostname,
                                           port: hostport,
                                           msg: 'close' } );
               });

         client.on( 'connect',
               function()
               {
                  socket.emit( 'status', { host: hostname,
                                           port: hostport,
                                           msg: 'connect' } );
               });
         client.on( 'error',
               function()
               {
                  socket.emit( 'status', { host: hostname,
                                           port: hostport,
                                           msg: 'error' } );
               });

         client.on( 'lookup',
               function()
               {
                  socket.emit( 'status', { host: hostname,
                                           port: hostport,
                                           msg: 'lookup' } );
               });

         socket.on( 'command',
               function( cmd )
               {
                  if( !client.destroyed )
                  {
                     client.write( cmd + '\n' );
                  }
               });
         socket.on( 'telopt',
               function( cmd )
               {
                  if( !client.destroyed )
                  {
                     client.write( cmd + '\n' );
                  }
               });
      });
