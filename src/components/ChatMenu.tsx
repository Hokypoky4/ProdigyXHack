import { h, FunctionalComponent } from "preact"
import { GoPrimitiveDot } from "react-icons/go"
import { useEffect, useState, useRef } from "preact/hooks"
import { io, Socket } from "socket.io-client"
import MenuToggler from "./MenuToggler"
import { getPlayer } from "../hack"
import { Player } from "../types/player"

interface Message {
    message: string
    name: string
}

const ChatMenu: FunctionalComponent = () => {
    const [visible, setVisible] = useState<boolean>(false)
    const [userCount, setUserCount] = useState<number>(0)
    const [socket, setSocket] = useState<Socket>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const messageRef = useRef<HTMLDivElement>(null)

    const player = getPlayer() as Player

    useEffect(() => {
        const socket = io("https://prodigy-x-chat.herokuapp.com")
        setSocket(socket)
        socket.on("userCount", (count: number) => {
            setUserCount(count)
        })
        socket.on("chat", (message: Message) => {
            setMessages(messages => [...messages, message])
        })
    }, [])

    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.scrollTop = messageRef.current.scrollHeight
        }
    }, [messages])

    function onSubmit (e: Event) {
        e.preventDefault()
        const input = inputRef.current
        if (input.value) {
            socket.emit("chat", {
                message: input.value,
                name: player.getName()
            })
            input.value = ""
        }
    }

    return (
        <div>
            <div className="absolute rounded w-1/5 h-2/5 bottom-16 right-8 bg-gray-200 bg-opacity-90" id="chat-mainframe" data-visible={visible}>
                <div>
                    <p className="w-1/2 pl-3 text-lg font-bold inline-block">Prodigy X Chat</p>
                    {/* @ts-ignore */}
                    <p className="w-1/2 pr-3 text-right text-sm font-bold inline-block text-[#5fc4b9]"><GoPrimitiveDot className="inline-block" color="#5fc4b9" />{userCount} Online</p>
                </div>
                <div className="flex flex-col rounded overflow-y-scroll m-6 p-2 bg-gray-300 bg-opacity-90 w-2/2 h-3/4" ref={messageRef}>
                    {messages.map((message, index) => {
                        return <div className="shrink-0 grow-0" key={index}>{message.name}: {message.message}</div>
                    })}
                </div>
                <form onSubmit={onSubmit}>
                    <input ref={inputRef} type="text" className="w-full" placeholder="Enter message..." />
                </form>
            </div>
            <MenuToggler toggled={!visible} onToggle={() => setVisible(!visible)} bottomRight={true} />
        </div>
    )
}

export default ChatMenu
