var express = require( 'express' );
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var net = require( 'net' );

const hostname = 'www.darkstonemud.com', hostport = 5432;

app.use( express.static(__dirname + '/public') );
http.listen( 8080, 
      function()
      {
         console.log('listening on port 8080' );
      });

io.on( 'connection',
      function( socket )
      {
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
