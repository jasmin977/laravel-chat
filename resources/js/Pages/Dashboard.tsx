import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { PageProps } from "@/types";
import { useEffect, useState } from "react";
import axios from "axios";

interface User {
    name: string;
    email: string;
}
interface Message {
    text: string;
    sender: User;
}

 
export default function Dashboard({ auth }: PageProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState<string>("");
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
    };

    useEffect(() => {
        const channel = window.Echo.join("presence.chat.1");

        channel
            .here((users: User[]) => {
                setOnlineUsers(users);
            })
            .joining((user: User) => {
                setOnlineUsers((prevUsers) => [...prevUsers, user]);
                console.log(user.name, 'joined');
            })
            .leaving((user: User) => {
                setOnlineUsers((prevUsers) => prevUsers.filter(u => u.name !== user.name));
                console.log(user.name, 'left');
            })
            .listen(".chat-message", (event) => {
                setMessages((prevMessages) => [...prevMessages, { text: event.message, sender: event.user }]);
                console.log(event);
            });

        // Cleanup on component unmount
        return () => {
            channel.leave();
        };
    }, []);

    const handleSendMessage = () => {
        if (inputText.trim() === "") return;

        axios.post("/chat-message", {
            message: inputText,
        });
        setInputText("");
    };
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-4">
                            <h3 className="font-semibold text-lg">Online Users</h3>
                            <ul>
                                {onlineUsers.map((user, index) => (
                                    <li key={index}>{user.name}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`my-2 ${
                                        message.sender.name === auth.user.name
                                            ? "text-right"
                                            : "text-left"
                                    }`}
                                >
                                    <span className="px-2 py-1 bg-gray-300 rounded-lg inline-block">
                                        {message.text}
                                    </span>
                                    <span className="px-2 py-1 text-black">
                                        {message.sender.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center p-4">
                            <input
                                type="text"
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-2"
                                placeholder="Type your message..."
                                value={inputText}
                                onChange={handleInputChange}
                            />
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                onClick={handleSendMessage}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
