import React, {useEffect, useRef, useState} from "react";
import {v4 as uniqueId} from 'uuid';
import styles from "@/styles/Chat.module.css";
import {Message, OpenAIRole} from "@/pages/api/chat";


const initialPrompt: Message[] = [
    {
        id: uniqueId(),
        role: OpenAIRole.system,
        text: "You're DeleGPT, A 500level course advisor in the department of Computer Engineering, University of Benin.",
    },
    {
        id: uniqueId(),
        role: OpenAIRole.user,
        text: "Introduce yourself briefly",
    },
];

const Chat = () => {
    const bottomRef = useRef(null)
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [error, setError] = useState<string>('')
    const [isResponding, setIsResponding] = useState<boolean>(false)


    const askGPT = async (messages: Message[]) => {
        setIsResponding(true)
        const msgId = uniqueId();
        const latestMessages = messages.concat(
            {text: 'Typing...', id: msgId, sent_at: Date.now(), role: OpenAIRole.assistant, is_typing: true},
        )
        setMessages(latestMessages)
        try {
            const response = await fetch('/api/chat/', {
                method: 'POST',
                body: JSON.stringify(messages)
            });
            const json = await response.json();
            if (response.ok) {
                setMessages(latestMessages.map((msg) => {
                    if (msg.id == msgId) {
                        msg.text = json.text
                        msg.is_typing = false;
                        return msg;
                    }
                    return msg
                }))
                if (json.is_not_done_typing) {
                    askGPT(latestMessages);
                }
            } else {
                setError(json.error ?? 'Something went wrong');
            }
        } catch (e: any) {
            setError(e.message ?? 'Something went wrong');
        }
        setIsResponding(false)
    };

    const onType = (event: React.ChangeEvent<HTMLInputElement>) => setNewMessage(event.target.value);

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") sendMessage(newMessage).then((_) => setNewMessage(''));
    }

    const isAI = (type: OpenAIRole) => [OpenAIRole.system, OpenAIRole.assistant].includes(type)

    const sendMessage = async (text: string) => {
        if (text.length <= 2) return;
        const msg: Message = {
            id: uniqueId(),
            sent_at: Date.now(),
            role: OpenAIRole.user,
            text,
        }
        const latestMessages = messages.concat(msg)
        setMessages(latestMessages)
        await askGPT(latestMessages);
    };

    const scrollToBottom = () => {
        if (bottomRef.current) { // @ts-ignore
            bottomRef.current?.scrollIntoView({behavior: "smooth"})
        }
    }

    const formatTimestamp = (value?: number) => {
        return new Intl.DateTimeFormat('en-NG', {
            dateStyle: 'medium',
            timeStyle: 'short',
            hour12: true,
        }).format(value)
    }


    useEffect(() => {
        askGPT(initialPrompt)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages]);


    if (error.length != 0) return <div className={styles.chat_feed}>
        <Header/>
        <div className={styles.chat_panel}
             style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <h1 className="text-2xl text-red-500">{error}</h1>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
                    onClick={() => window.location.reload()}>Reload
            </button>
        </div>
    </div>


    return (
        <div className={styles.chat_feed}>
            <Header/>
            <div className={styles.chat_panel}>
                {messages.slice(2).map((message, index) => {
                    const rightClassName = `text-[9px] ml-2 text-gray-50`;
                    const leftClassName = 'text-[9px] ml-2 text-gray-500';
                    const className = `text-sm md:text-md  ${styles.chat} ${isAI(message.role) ? styles.user_type_system : styles.user_type_user} ${message.is_typing && 'italic'}`;
                    const isLastMessage = index == messages.slice(2).length - 1;
                    return <div
                        key={message.id}
                        ref={isLastMessage ? bottomRef : null}
                        className={className}>
                        {message.text}
                        {!message.is_typing &&
                            <span
                                className={isAI(message.role) ? rightClassName : leftClassName}>
                            {isLastMessage ? 'Just now' : formatTimestamp(message.sent_at)}
                        </span>
                        }
                    </div>
                })}
            </div>
            <div className={styles.msg_send}>
                <div className={styles.msg_txt}>
                    <input
                        type="text"
                        placeholder="Type message here..."
                        value={newMessage}
                        onChange={onType}
                        onKeyDown={handleKeyDown}
                        className={styles.input_text}
                        disabled={isResponding}
                    />
                </div>
            </div>
        </div>
    );
};

const Header = () => {
    return <div>
        <h1>DeleGPT</h1>
        <span>500level Course Advisor</span>
    </div>
}

export default Chat;