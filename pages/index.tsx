import React, {useEffect, useRef, useState} from "react";
import {v4 as uniqueId} from 'uuid';
import {Message, OpenAIRole} from "@/pages/api/chat";

import styles from "@/styles/Chat.module.css";
import useStorage from "../utils/use-storage";
import {ChatContext, chatContexts} from "@/Components/Select";
import {Header} from "@/Components/Header";
import {formatTimestamp} from "@/utils/date";


const getInitialPrompt = (ctx: ChatContext): Message[] => {
    return [
        {
            id: uniqueId(),
            role: OpenAIRole.system,
            text: ctx.system_prompt,
        },
        {
            id: uniqueId(),
            role: OpenAIRole.user,
            text: "Introduce yourself very briefly",
        },
    ];
}

const Chat = () => {
    const bottomRef = useRef(null);
    const {
        storedValue: savedMsgs,
        saveLocally: saveMsgsLocally,
        clear: clearChatMsgs
    } = useStorage<Message[]>('chat_chatMsgs');
    const {
        storedValue: savedChatContext,
        saveLocally: saveChatContextLocally
    } = useStorage<ChatContext>('chat_context');

    const [chatMsgs, setChatMsgs] = useState<Message[]>([]);
    const [selectedChatContext, setSelectedChatContext] = useState<ChatContext>(chatContexts[0]);

    const [newMessage, setNewMessage] = useState<string>('');
    const [error, setError] = useState<string>('')
    const [isResponding, setIsResponding] = useState<boolean>(false);


    const askGPT = async (chatMsgs: Message[]) => {
        setIsResponding(true)
        const msgId = uniqueId();
        const latestMessages = chatMsgs.concat(
            {text: 'Typing...', id: msgId, sent_at: Date.now(), role: OpenAIRole.assistant, is_typing: true},
        )
        setChatMsgs(latestMessages)
        try {
            const response = await fetch('/api/chat/', {
                method: 'POST',
                body: JSON.stringify(chatMsgs)
            });
            const json = await response.json();
            if (response.ok) {
                const texts = json.text.split('```');
                for (let i = 0; i < texts.length; i++) {
                    const text = texts[i];
                    if (i == 0) {
                        setChatMsgs(latestMessages.map((msg) => {
                            if (msg.id == msgId) {
                                msg.text = text
                                msg.is_typing = false;
                                return msg;
                            }
                            return msg
                        }))
                        continue;
                    }
                    const is_code = i % 2 == 1;
                    setChatMsgs((chatMsgs) => chatMsgs.concat({
                        text,
                        id: uniqueId(),
                        sent_at: Date.now(),
                        role: OpenAIRole.assistant,
                        is_code,
                    }));
                }
                if (json.is_not_done_typing) {
                    askGPT(latestMessages);
                }
            } else {
                handleError(json.error);
            }
        } catch (e: any) {
            handleError(e.message);
        }
        setIsResponding(false)
    };

    const onType = (event: React.ChangeEvent<HTMLInputElement>) => setNewMessage(event.target.value);

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") sendMessage(newMessage);
    }

    const handleError = (err?: string) => {
        if (chatMsgs.length === 0)
            setError(err ?? "Something went wrong");
    };

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
        const latestMessages = chatMsgs.concat(msg)
        setChatMsgs(latestMessages)
        await askGPT(latestMessages);
    };

    const scrollToBottom = () => {
        if (bottomRef.current) { // @ts-ignore
            bottomRef.current?.scrollIntoView({behavior: "smooth"})
        }
    }

    const changeChatContext = (ctx: ChatContext) => {
        if (ctx.id == selectedChatContext.id) return;
        clearChatMsgs();
        setChatMsgs([]);
        saveChatContextLocally(ctx);
        setSelectedChatContext(ctx);
        askGPT(getInitialPrompt(ctx));
    }

    useEffect(() => {
        if (savedChatContext != undefined) {
            setSelectedChatContext(savedChatContext);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (savedMsgs?.length == 0) {
            askGPT(getInitialPrompt(savedChatContext ?? selectedChatContext));
        } else setChatMsgs(savedMsgs ?? [])

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        scrollToBottom()
        if (chatMsgs[chatMsgs.length - 1]?.is_typing == false) {
            saveMsgsLocally(chatMsgs);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatMsgs]);


    if (error.length != 0) return <div className={styles.chat_feed}>
        <Header chatContext={selectedChatContext} selectChatContext={(ctx) => {
            changeChatContext(ctx)
        }}/>
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
            <Header chatContext={selectedChatContext} selectChatContext={(ctx) => {
                changeChatContext(ctx)
            }}/>
            <div className={styles.chat_panel}>
                {chatMsgs.slice(2).map((message, index) => {
                    const rightClassName = `text-[9px] ml-2 text-gray-50`;
                    const leftClassName = 'text-[9px] ml-2 text-gray-500';
                    const className = `text-sm md:text-md  ${styles.chat} ${isAI(message.role) ? styles.user_type_system : styles.user_type_user} ${message.is_typing && 'italic'}`;
                    const isLastMessage = index == chatMsgs.slice(2).length - 1;
                    return <div
                        key={message.id}
                        ref={isLastMessage ? bottomRef : null}
                        className={className}>
                        {message.text}
                        {!message.is_typing &&
                            <span
                                className={isAI(message.role) ? rightClassName : leftClassName}>
                            {formatTimestamp(message.sent_at)}
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
                    <div>
                        <svg onClick={() => {
                            sendMessage(newMessage);
                        }} cursor="pointer" xmlns="http://www.w3.org/2000/svg" fill="#000000" viewBox="0 0 24 24"
                             strokeWidth={1.5}
                             stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;