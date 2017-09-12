# noMUDde
### Node.js based MUD client

noMUDde is a basic MUD client written using the express.js and socket.io libraries.

#### TODO
- [x] support ANSI colors
- [x] clickable links and emails
- [x] customizeable fonts and font-size
- [x] handle telnet server/client negotiations
- [ ] better proxying support
- [ ] command history
- [ ] ~~support MXP [MUD eXtension Protocol](http://www.zuggsoft.com/zmud/mxp.htm)~~ Yeah not happening anytime soon.
- [ ] parse prompt and create health/mana/etc bars
- [ ] triggers, timers, aliases, etc
- [ ] save all of the above to user accounts

Check it out live at www.darkstonemud.com:8080

Thanks and let me know what you think!

#### Installing
```
npm install express
npm install socket.io
```
In index.js:7 change _**hostname**_ and _**hostport**_ to your host-name and port.
In index.js:10 change the listening port to whichever port you want the http server to listen on

#### Configuring reverse proxy with nginx
Coming soon
