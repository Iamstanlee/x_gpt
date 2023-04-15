import React, {useEffect, useRef, useState} from "react";
import {v4 as uniqueId} from 'uuid';
import {Message, OpenAIRole} from "@/pages/api/chat";

import styles from "@/styles/Chat.module.css";


const initialPrompt: Message[] = [
    {
        id: uniqueId(),
        role: OpenAIRole.system,
        text: "You're DeleGPT, A 500level course advisor in the department of Computer Engineering, University of Benin. You can only provide information regarding computer engineering and advice students on their academic",
    },
    {
        id: uniqueId(),
        role: OpenAIRole.user,
        text: "Introduce yourself very briefly",
    },
];

const Chat = () => {
    const bottomRef = useRef(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [error, setError] = useState<string>('')
    const [isResponding, setIsResponding] = useState<boolean>(false);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(false);
    const [textsToSpeak, setTextsToSpeak] = useState<string[]>([]);


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
                if (isVoiceEnabled)
                    setTextsToSpeak((textsToSpeak) => textsToSpeak.concat(json.text));
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
        if (event.key === "Enter") sendMessage(newMessage);
    }

    const isAI = (type: OpenAIRole) => [OpenAIRole.system, OpenAIRole.assistant].includes(type)

    const sendMessage = async (text: string) => {
        if (text.length === 0) return;
        const msg: Message = {
            id: uniqueId(),
            sent_at: Date.now(),
            role: OpenAIRole.user,
            text,
        }
        setNewMessage('')
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

    const textToSpeech = (text: string) => {
        setIsSpeaking(true);
        const voice = new SpeechSynthesisUtterance();
        voice.text = text;
        voice.lang = 'en-US';
        voice.rate = 1.4;
        voice.onend = () => {
            setIsSpeaking(false);
            setTextsToSpeak((textsToSpeak) => textsToSpeak.slice(1));
        };
        voice.onerror = (e) => {
            console.log('error speaking', e)
        }
        window.speechSynthesis.speak(voice);
    }


    const handleRecording = async () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onresult = async (event) => {
            if (event.results.length == 0) return;
            const text = event.results[0][0].transcript;
            await sendMessage(text);
        }
        recognition.onend = () => {
            setIsRecording(false);
        }
        if (isRecording) {
            endRecording(recognition);
        } else {
            startRecording(recognition);
        }
    }

    const startRecording = async (recognition: SpeechRecognition) => {
        recognition.start();
        setIsRecording(true);
    }
    const endRecording = async (recognition: SpeechRecognition) => {
        recognition.abort();
        setIsRecording(false);
    }

    useEffect(() => {
        askGPT(initialPrompt)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages]);

    useEffect(() => {
        if (textsToSpeak.length == 0) return;
        if (isSpeaking) return;
        textToSpeech(textsToSpeak[0]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [textsToSpeak])


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
            <Header voiceEnabled={isVoiceEnabled} enableOrDisableVoice={() => {
                setIsVoiceEnabled(!isVoiceEnabled)
            }}/>
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
                    {isVoiceEnabled && <div className={`${isRecording ? styles.recording : styles.not_recording}`}
                                            onClick={() => handleRecording()}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                             className="w-6 h-6">
                            <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z"/>
                            <path
                                d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z"/>
                        </svg>
                    </div>}

                </div>
            </div>
        </div>
    );
};

const Header = ({voiceEnabled, enableOrDisableVoice}: {
    voiceEnabled?: boolean,
    enableOrDisableVoice?: () => void
}) => {
    return <div>
        <h1>DeleGPT</h1>
        <span>500level Course Advisor</span>
        {voiceEnabled ? <div onClick={enableOrDisableVoice}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path
                    d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z"/>
                <path
                    d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z"/>
            </svg>
        </div> : <div onClick={enableOrDisableVoice}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd"
                      d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
                      clipRule="evenodd"/>
            </svg>
        </div>}
    </div>
}

export default Chat;