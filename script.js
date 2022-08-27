var ws = new WebSocket("ws://localhost:1984");

function move(data){
    ws.send("some move");
}


ws.addEventListener("open", () =>{
    console.log("connected to server");
})

ws.addEventListener("message", m =>{
    console.log(`recived data: ${m.data}`);
    if (m.data === "you are player 0"){
        startAsWhite();
    }
    if(m.data == "you are player 1"){
        startAsBlack();
    }
    if(m.data.includes("opponent move: ")){
        move(m.data.substring(15));
    }
})

function startAsWhite(){

}

function startAsBlack(){

}

function move(moved){

}