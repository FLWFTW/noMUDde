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
   data = sanitizeString( data );
   data = ansiEncode( data );
   data = parseEmails( data );
   data = parseURLs( data );
   writeTermRaw( data );
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
            $("#input").select();
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
