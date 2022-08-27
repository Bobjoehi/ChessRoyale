var ws = new WebSocket("ws://localhost:1984");

function move(data){
    console.log("sending my move");
    ws.send(data);
}


ws.addEventListener("open", () =>{
    console.log("connected to server");
})

ws.addEventListener("message", m =>{
    console.log(`recived data: ${m.data}`);
    text = m.data + "";
    if (text === "you are player 0"){
        startAsWhite();
    }
    if(text === "you are player 1"){
        startAsBlack();
    }
    if(text.includes("opponent move: ")){
        opponentMove(m.data.substring(15));
    }
})

function startAsWhite(){

}

function startAsBlack(){

}

function opponentMove(){
    
}