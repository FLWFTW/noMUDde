function sanitizeString( input )
{
   var tmp = input.split("");
   var output = new String();

   for( i = 0; i < input.length; i++ )
   {
      switch( tmp[i] )
      {
         default:
            output += tmp[i];
            break;
         case '<':
            output += "&lt;";
            break;
         case '>':
            output += "&gt;";
            break;
         case '&':
            output += "&amp;";
            break;
         case ' ':
            output += "&nbsp;";
            break;
         case '"':
            output += "&quot;";
            break;
         case '\'':
            output += "&apos;";
            break;
         case '\n':
            output += "<br>";
            break;
         case '\r':
            break;
      }
   }
   return output;
}

function ansiEncode( input )
{
   if( input == "\xFF\xFC\x01" ) //IAC WONT TELOPT ECHO
      getElementById("input").setAttribute( 'type', 'password' );
   else if( input == "\xFF\xFB\x01" ) //IAC WILL TELOPT ECHO
      getElementById("input").setAttribute( 'type', 'text' );

   //all the colors below are just my visual estimation of what they should be,
   //feel free to replace with the actuall hex colorcodes if you feel like it.

   //excess stuff that I'm not sure what to do with...
   input = input.replace( /\[m/g, "<span style='color: silver;background-color:black;'>" );
   input = input.replace( /\[0m/g, "<span style='color: silver;background-color:black;'>" );
   input = input.replace( /\[0;/g, "[" );
   input = input.replace( /\[1;/g, "[" );
   input = input.replace( /\[1m;/g, "<span style='color: white;background-color:black;'>" );
   input = input.replace( /\[1m/g, "<span style='color: white;background-color:black;'>" );

   ////////////////foreground colors//////////////////////
   //normal 'dull' colors
   input = input.replace( /\[30m/g, "<span class='fg-x'>" );
   input = input.replace( /\[31m/g, "<span class='fg-r'>" );
   input = input.replace( /\[32m/g, "<span class='fg-g'>" );
   input = input.replace( /\[33m/g, "<span class='fg-o'>" );
   input = input.replace( /\[34m/g, "<span class='fg-b'>" );
   input = input.replace( /\[35m/g, "<span class='fg-p'>" );
   input = input.replace( /\[36m/g, "<span class='fg-c'>" );
   input = input.replace( /\[37m/g, "<span class='fg-w'>" );

   //normal 'dull' colors
   input = input.replace( /\[0;30m/g, "<span class='fg-x'>" );
   input = input.replace( /\[0;31m/g, "<span class='fg-r'>" );
   input = input.replace( /\[0;32m/g, "<span class='fg-g'>" );
   input = input.replace( /\[0;33m/g, "<span class='fg-o'>" );
   input = input.replace( /\[0;34m/g, "<span class='fg-b'>" );
   input = input.replace( /\[0;35m/g, "<span class='fg-p'>" );
   input = input.replace( /\[0;36m/g, "<span class='fg-c'>" );
   input = input.replace( /\[0;37m/g, "<span class='fg-w'>" );

   //bright 'bold' colors
   input = input.replace( /\[1;30m/g, "<span class='fg-z'>" );
   input = input.replace( /\[1;31m/g, "<span class='fg-R'>" );
   input = input.replace( /\[1;32m/g, "<span class='fg-G'>" );
   input = input.replace( /\[1;33m/g, "<span class='fg-Y'>" );
   input = input.replace( /\[1;34m/g, "<span class='fg-B'>" );
   input = input.replace( /\[1;35m/g, "<span class='fg-P'>" );
   input = input.replace( /\[1;36m/g, "<span class='fg-C'>" );
   input = input.replace( /\[1;37m/g, "<span class='fg-W'>" );

   /////////background colors///////////////
   //normal 'dull' colors //normal 'dull' colors
   input = input.replace( /\[40m/g, "<span class='bg-x'>" );
   input = input.replace( /\[41m/g, "<span class='bg-r'>" );
   input = input.replace( /\[42m/g, "<span class='bg-g'>" );
   input = input.replace( /\[43m/g, "<span class='bg-o'>" );
   input = input.replace( /\[44m/g, "<span class='bg-b'>" );
   input = input.replace( /\[45m/g, "<span class='bg-p'>" );
   input = input.replace( /\[46m/g, "<span class='bg-c'>" );
   input = input.replace( /\[47m/g, "<span class='bg-w'>" );

   //bright 'bold' colors
   input = input.replace( /\[5;40m/g, "<span class='bg-z'>" );
   input = input.replace( /\[5;41m/g, "<span class='bg-R'>" );
   input = input.replace( /\[5;42m/g, "<span class='bg-G'>" );
   input = input.replace( /\[5;43m/g, "<span class='bg-Y'>" );
   input = input.replace( /\[5;44m/g, "<span class='bg-B'>" );
   input = input.replace( /\[5;45m/g, "<span class='bg-P'>" );
   input = input.replace( /\[5;46m/g, "<span class='bg-C'>" );
   input = input.replace( /\[5;47m/g, "<span class='bg-W'>" );

   //Count how many spans I have to close
   var tmp = input.replace( /\<span/g, "" );
   var count = (input.length - tmp.length) / "<span".length;
   //close them
   for( i = 0; i < count; i++ )
      input += "</span>";
 
   return input;
}

function writeTerm( data )
{
   $("#output").append( ansiEncode( sanitizeString( data ) ) );
   $("#output").scrollTop( $("#output")[0].scrollHeight);
};

   
   $(document).ready(
      function()
      {
         var socket = io();
         $("#input").select();

         socket.on( 'data',
            function( data )
            {
               writeTerm( data );
            });

         socket.on( 'status',
               function( data )
               {
                  switch( data.msg )
                  {
                     case 'connect':
                        {
                           writeTerm( '\n::Connected to ' + data.host+ ' on port ' + data.port + '::\n' );
                           $("#connect").hide( 400 );
                           $("#input").show( 400 );
                           break;
                        }
                     case 'lookup':
                        {
                           writeTerm( '\n::Resolving host ' + data.host+ ' port ' + data.port + '::\n' );
                           break;
                        }
                     case 'error':
                        {
                           writeTerm( '\n::Unable to connect to ' + data.host+ ' port ' + data.port + '::\n' );
                           writeTerm( '::Connection refused::\n' );
                           break;
                        }
                     case 'close':
                        {
                           writeTerm( '\n::Connection closed::' );
                           $("#input").hide( 400 );
                           $("#connect").show( 400 );
                           break;
                        }
                     default:
                        {
                           writeTerm( data.msg );
                           break;
                        }
                  }
               });

         $("#input_form").submit(
            function( event )
            {
               event.preventDefault();
               socket.emit( "command", $("#input").val() );
               $("#input").select();
            });

         $("#connect").click(
               function()
               {
                  location.reload();
               });

       });
