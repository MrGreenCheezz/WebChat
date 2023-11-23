import React from 'react'
import './Message.css'

function MessageComponent(props) {
    return (
        <div className='Message'>
            <div className="message-date">{props.date}</div>
            <div className="message-user-info">
                <div className="message-username">{props.messageAuthor}</div>
                <div className="message-text">{props.messageText}</div>
            </div>
        </div>
    )
}

export default MessageComponent