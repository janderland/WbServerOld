var WebSocketServer = require('websocket').server;
var http = require('http');

//Wish Banana Modules
var wb = {};
wb.Messages = require("../messages.js");
 
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});
 
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production 
    // applications, as it defeats all standard cross-origin protection 
    // facilities built into the protocol and the browser.  You should 
    // *always* verify the connection's origin and decide whether or not 
    // to accept it. 
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed. 
  return true;
}
 
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin 
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('wishbanana', request.origin);
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' accepted.');

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });

    var tids = [];
    var tid1, tid2;
    
    tid1 = setInterval(function () {
        var msg = new wb.Messages.matched("Jon");
        connection.sendUTF(JSON.stringify(msg));
    }, 10000);
    tids.push(tid1);

    tid1 = setTimeout(function () {
        var tid2 = setInterval(function () {
            var msg = new wb.Messages.countDown(5);
            connection.sendUTF(JSON.stringify(msg));
        }, 10000);
        tids.push(tid2);
    }, 1000);    
    tids.push(tid1);

    tid1 = setTimeout(function () {
        var tid2 = setInterval(function () {
            var msg = new wb.Messages.countDown(4);
            connection.sendUTF(JSON.stringify(msg));
        }, 10000);
        tids.push(tid2);
    }, 2000);    
    tids.push(tid1);

    tid1 = setTimeout(function () {
        var tid2 = setInterval(function () {
            var msg = new wb.Messages.countDown(3);
            connection.sendUTF(JSON.stringify(msg));
        }, 10000);
        tids.push(tid2);
    }, 3000);    
    tids.push(tid1);

    tid1 = setTimeout(function () {
        var tid2 = setInterval(function () {
            var msg = new wb.Messages.countDown(2);
            connection.sendUTF(JSON.stringify(msg));
        }, 10000);
        tids.push(tid2);
    }, 4000);    
    tids.push(tid1);

    tid1 = setTimeout(function () {
        var tid2 = setInterval(function () {
            var msg = new wb.Messages.countDown(1);
            connection.sendUTF(JSON.stringify(msg));
        }, 10000);
        tids.push(tid2);
    }, 5000);    
    tids.push(tid1);

    tid1 = setTimeout(function () {
        var tid2 = setInterval(function () {
            var msg = new wb.Messages.countDown(0);
            connection.sendUTF(JSON.stringify(msg));
        }, 10000);
        tids.push(tid2);
    }, 6000);    
    tids.push(tid1);

    tid1 = setTimeout(function () {
        var tid2 = setInterval(function () {
            var msg = new wb.Messages.gameOver(true);
            connection.sendUTF(JSON.stringify(msg));
        }, 10000);
        tids.push(tid2);
    }, 7000);    
    tids.push(tid1);

    tid1 = setTimeout(function () {
        var tid2 = setInterval(function () {
            connection.sendUTF("{hello:2");
        }, 10000);
        tids.push(tid2);
    }, 8000);    
    tids.push(tid1);

    tid1 = setTimeout(function () {
        var tid2 = setInterval(function () {
            connection.sendUTF('{"id":10}');
        }, 10000);
        tids.push(tid2);
    }, 9000);    
    tids.push(tid1);

    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');

        //Clear up all the callbacks
        for (var tid in tids) {
            clearInterval(tid);
        }
    });
});