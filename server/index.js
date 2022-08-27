const WebSocket = require("ws");

const wss = new WebSocket.Server({port:1984});

wss.on("connection", ws =>{
    console.log("new client connected");
    if (wss.clients.size > 2){
        console.log("too many clients!");
        ws.send("room full!");
        ws.close();
        console.log("new client removed");
        return;
    }else if (wss.clients.size == 2){
        console.log("preparing game");
        const player = [];
        let count = 0;
        wss.clients.forEach(function start(client) {
            client.send("you are player " + count);
            count ++;
            player.push(client);
        })
    }

    player[0].on("message", m =>{
        console.log(`player 0 made move: ${m}`);
        player[1].send(`opponent move: ${m}`);
    })

    player[1].on("message", m =>{
        console.log(`player 1 made move: ${m}`);
        player[0].send(`opponent move: ${m}`);
    })

    ws.on("close", () =>{
        console.log("client disconnected");
    })
})