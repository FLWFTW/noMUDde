var socket = io();

var commands = {
       IAC:     255, // interpret as command
       DONT:    254, // you are not to use option
       DO:      253, // please use option
       WONT:    252, // I won't use option
       WILL:    251, // I will use option
       SB:      250, // sub-negotiation
       GA:      249, // Go-ahead
       EL:      248, // Erase line
       EC:      247, // Erase character
       AYT:     246, // Are you there?
       AO:      245, // Abort output (but let prog finish)
       IP:      244, // Interrupt (permanently)
       BREAK:   243,
       DM:      242, // Data mark
       NOP:     241,
       SE:      240, // End sub-negotiation
       EOR:     239, // End of record (transparent mode)
       ABORT:   238, // Abort process
       SUSP:    237, // Suspend process
       EOF:     236, // End of file
       SYNCH:   242
};

var telOpts =
   {
       ECHO: 1,   // Echo
       SUPR: 3,   // Supress
       STAT: 5,   // Status
       TIME: 6,   // Timing Mark
       TTYP: 24,  // Terminal Type
       WSIZ: 31,  // Window Size
       TSPD: 32,  // Terminal Speed
       RFCT: 33,  // Remote Flow Control
       LNMD: 34,  // Line Mode
       ENVS: 36,  // Environmental Variables
       MXP:  91  // MPX (MUD eXtension Protocol)
   }

function turnEchoOff()
{
   console.log( "Echo OFF" );
   $("#input_form").hide();
   $("#password_form").show();
   $("#pw_input").select();
}

function turnEchoOn()
{
   console.log( "Echo ON" );
   $("#input_form").show();
   $("#password_form").hide();
   $("#input").select();
}
       

function telnetNegotiations( input )
{
   var output = new String();

   for( i = 0; i < input.length; i++ )
   {
      switch( input.charCodeAt(i) )
      {
         case commands.IAC:
         {
            let iac = input.charCodeAt( i );
            let command = input.charCodeAt( i + 1 );
            let option = input.charCodeAt( i + 2 );

            if( command == commands.WILL ) //251
            {
               if( option == telOpts.ECHO )
               {
                  turnEchoOff();
               }
            }
            else if( command == commands.WONT ) //252
            {
               if( option == telOpts.ECHO )
               {
                  turnEchoOn();
               }
            }
            else
            {
               console.log( "Unsupported telnet negotiation command " + command + "." );
            }
            i+= 2; //skip the command and option characters

            break;
         }
         default:
         {
            output += input[i];
            break;
         }
      }
   }
   return output;
}

function sanitizeString( input )
{
   var output = new String();

   for( i = 0; i < input.length; i++ )
   {
      switch( input.charAt(i) )
      {
         default:
            output += input.charAt(i);
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
   input = input.replace( /\[([0-9];)*[0-9]*m/g,
         function( data )
         {
            data = data.substr( 1, data.length ); //knock off the leading '['
            var args = data.split( ';' );
            var ret = new String();
            if (args[0] == 1 ) //Bright mode is set
            {
               var colorClass = 'B' + args[args.length-1];
               args = args.slice( 1, args.length-1 );
               for( i = 0; i < args.length; i++ )
               {
                  ret += "ansi" + args[i] + " ";
               }
               ret += colorClass;
            }
            else
            {
               var colorClass = 'c' + args[args.length-1];
               args = args.slice( 0, args.length-1);
               for( i = 0; i < args.length; i++ )
               {
                  ret += "ansi" + args[i] + " ";
               }
               ret += colorClass;
            }
               return "<span class='" + ret + "'>";
         });

   //Count how many spans I have to close
   var tmp = input.replace( /\<span/g, "" );
   var count = (input.length - tmp.length) / "<span".length;
   //close them
   for( i = 0; i < count; i++ )
      input += "</span>";
 
   return input;
}

function parseEmails( data )
{
   var emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;

   data = data.replace( emailRegex,
         function( email )
         {
            return "<a class='output' href='mailto:" + email + "' target='_blank'>" + email + "</a>";
         });
   return data;
}

function parseURLs( data )
{
   var urlRegex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/ig;

   data = data.replace( urlRegex,
         function( url )
         {
            return "<a class='output' href='" + url + "' target='_blank'>" + url + "</a>";
         });
   return data;
}

function writeTermRaw( data )
{
   $("#output").append( data );
   $("#output").scrollTop( $("#output")[0].scrollHeight);
}

function writeTerm( data )
{
   data = telnetNegotiations( data );
   data = sanitizeString( data );
   data = ansiEncode( data );
   data = parseEmails( data );
   data = parseURLs( data );
   writeTermRaw( data );
};

   
$(document).ready(
   function()
   {
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
                        writeTermRaw( '\n::Connected to ' + data.host + ' on port ' + data.port + '::\n<br>' );
                        $("#connect").hide( 400 );
                        $("#input").show( 400 );
                        break;
                     }
                  case 'lookup':
                     {
                        writeTermRaw( '\n::Resolving host ' + data.host+ ' port ' + data.port + '::\n<br>' );
                        break;
                     }
                  case 'error':
                     {
                        writeTermRaw( '\n::Unable to connect to ' + data.host+ ' port ' + data.port + '::\n<br>' );
                        writeTermRaw( '::Connection refused::\n<br>' );
                        break;
                     }
                  case 'close':
                     {
                        writeTermRaw( '\n::Connection closed::<br>' );
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
            writeTermRaw( $("#input").val() + "<br>" );
            $("#input").select();
         });

      $("#password_form").submit(
         function( event )
         {
            event.preventDefault();
            socket.emit( "command", $("#pw_input").val() );
            $("#pw_input").select();
         });

      $("#connect").click(
            function()
            {
               location.reload();
            });

      $("#settings-tab").click(
            function()
            {
               $("#settings-content").toggle();
            });

      $("#font-select").on( 'change',
            function()
            {
               $("#output").css( "font-family", $("#font-select").val() );
               $("#output").scrollTop( $("#output")[0].scrollHeight);
            });
      $("#font-size").on( 'change',
            function()
            {
               $("#output").css( "font-size", $("#font-size").val() );
               $("#output").scrollTop( $("#output")[0].scrollHeight);
            });
    });
