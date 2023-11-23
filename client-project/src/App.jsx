import { useEffect } from 'react';
import { useState } from 'react'
import { useSound } from 'use-sound'
import { io } from 'socket.io-client'
import sound from '../bell.mp3'
import './App.css'
import MessageComponent from './MessageComponent';

function App(props) {
  var isRecording = false;
  var audiostream;
  const audioContext = new AudioContext();
  const panNode = audioContext.createStereoPanner();
  const audioBuffer = [];
  const [messages, setMessages] = useState([]);
  const [textInput, setInputText] = useState('');
  const [nameInput, setNameInput] = useState('');
  //const [Sounde] = useSound(sound);

  useEffect(() => {
    function recieveMessage(data) {
      setMessages([...messages, { TodayDate: data.TodayDate, Author: data.Author, Text: data.Text }])
      //Sounde();
    }
    function disconnectFromServer() {
      props.disconnectFunction();
    }
    function SendName() {
      props.socket.emit('setName', props.Name);
    }
    function LoadMessages(localmessages) {
      let temp = [];
      localmessages.forEach((m, index) => {
        temp.push({ TodayDate: m.messagedate, Author: m.authorname, Text: m.messagecontent })
      })
      setMessages([...temp, ...messages]);
      console.log("messages recieved")
    }

   

    props.socket.on('voice', (data) => {
      var bufferlenght = data.length;
      if(data.length === 0){
        bufferlenght = 44000;
      }
      const audioBuffer = audioContext.createBuffer(2, 45000, 48000);
      const newData = new Float32Array(data);
      audioBuffer.copyToChannel(newData, 0);
      audioBuffer.copyToChannel(newData, 1);

      const bufferSource = audioContext.createBufferSource();
      bufferSource.buffer = audioBuffer;
      bufferSource.connect(audioContext.destination);
      bufferSource.start();
    });

    props.socket.on('recieveLastMessages', (newmessages) => LoadMessages(newmessages));
    props.socket.on('serverMessage', recieveMessage);
    props.socket.on('connect', SendName);
    props.socket.on('disconnect', disconnectFromServer)
  })

  async function getMicrophoneStream() {
    isRecording = true;
    audiostream = await navigator.mediaDevices.getUserMedia({ audio: true,video:false });
    const source = audioContext.createMediaStreamSource(audiostream);
    const processor = audioContext.createScriptProcessor(8192, 1, 2);

    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
      if (!isRecording) return;
      // Здесь мы отправляем поток на сервер
      const channelData = e.inputBuffer.getChannelData(0);
      const buffer = new Float32Array(channelData);
      props.socket.emit('voice', buffer);
    };
  }

  function stopRecording() {
    if (audiostream) {
        // Останавливаем каждый отдельный трек (в данном случае, это аудиотрек)
        audiostream.getTracks().forEach(track => track.stop());
    }
    isRecording = false; // Устанавливаем флаг, что запись остановлена
}

  function ButtonSendClicked(event) {
    event.preventDefault();
    var dateData = new Date().toLocaleString();
    props.socket.emit('client-send-message', { TodayDate: dateData, Author: props.Name, Text: textInput })
    setInputText('');
    //var tempArray = messages;
    //tempArray.push({date: dateData, Author:"TestAuthor", Text:"TestText"});
    //setMessages(tempArray);
  }

  function ChangeNameButtonClicked() {
    props.setNameFunction(nameInput);
  }


  return (
    <div className='MainWindow'>
      <div className='ChatWindow'>
        {messages.map((element, index) => {
          return (
            <MessageComponent date={element.TodayDate} messageAuthor={element.Author} messageText={element.Text} key={index}></MessageComponent>
          )
        })}
      </div>
      <div className='UserWindow'>
        <div className='InputHolder'>
          <form onSubmit={event => ButtonSendClicked(event)}>
            <input className='ChatInput' type="text" placeholder='Write message..' onInput={e => setInputText(e.target.value)} value={textInput}></input>
            <button className='SendButton' type="submit">Send</button>
          </form>
          <button onClick={()=> getMicrophoneStream()}>Connect.</button>
          <button onClick={() => stopRecording()}>Disconnect.</button>
        </div>
      </div>
    </div>
  )
}

export default App
