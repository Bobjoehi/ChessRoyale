const WebSocket = require("ws");

const wss = new WebSocket.Server({port:1984});
let waitingPlayer;

wss.on("connection", ws =>{
    console.log("new client connected");
    if (waitingPlayer == null){
        waitingPlayer = ws;
    }else{
        ws["partner"] = waitingPlayer;
        waitingPlayer["partner"] = ws;
        waitingPlayer = null;
    }
    
    ws.on("message", m =>{
        console.log(`recived data: ${m}`);
        text = m + "";
        console.log(typeof(text));
        ws.partner.send(text);
    })

    ws.on("close", () =>{
        console.log("client disconnected");
    })
})