import React , { useState } from 'react'
import App from './App.jsx'
import { io } from 'socket.io-client'



function ChatComponent() {

    var name = "Test" + Math.floor(Math.random() * 100);
    const [socket, setSocket] = useState(null)
    const [nameInput,setNameInput] = useState('');

    function ButtonClicked(){
        setNickName(nameInput);
        name = nameInput;
        ConnectToServer();
        
    }

    function setNickName(newName) {
        name = newName;
    }
    function ConnectToServer() {
        const newConnection = io("http://25.57.123.71:3000");
        setSocket(newConnection);
        newConnection.emit('getLastMessages');
    }
    function DisconnectFromServer() {
        if(socket !== null){
            socket.disconnect();
            setSocket(null);
        }else{
            setSocket(null);
        }  
    }
    if(socket === null){
        return(
            <div style={{display:'flex', justifyContent:'center', width:'100vw', height:'100vh'}}>
                <div style={{display:'flex', justifyContent:'center', flexDirection:'column', maxWidth:'200px'}}>
                    <input type='text' placeholder='Write name..' onInput={e => setNameInput(e.target.value)} value={nameInput}></input>
                    <button onClick={() => ButtonClicked()}>Connect.</button>
                </div>
            </div>
        )
    }else{
        return (
            <div><App socket={socket} Name={nameInput} setNameFunction={setNickName} connectFunction={ConnectToServer} disconnectFunction={DisconnectFromServer} /></div>
        )
    }
    
}

export default ChatComponent