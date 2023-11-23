const socketAuth = (socket,next)=>{
    try{
        const name = socket.handshake.query.name;
        const password = socket.handshake.query.password;
    }
    catch{
        console.log("Error")
    }
}