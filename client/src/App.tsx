import React, { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:5000");

const App: React.FC = () => {
  const [user, setUser] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<
    { user: string; text: string; timestamp: Date }[]
  >([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const savedUser = localStorage.getItem("chatUser");
    let username: string | null = savedUser;

    if (!username) {
      username = prompt("Enter your username:");
      if (!username) {
        username = "User" + Math.floor(Math.random() * 1000);
        alert(`You didn't enter a name. Your temporary login: ${username}`);
      }
      localStorage.setItem("chatUser", username);
    }

    setUser(username);
  }, []);

  useEffect(() => {
    if (!user) return;

    socket.emit("join");

    socket.on("history", (history: any[]) => {
      setMessages(history.reverse());
    });

    socket.on("message", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("error", (err: string) => {
      setError(err);
      setTimeout(() => setError(""), 3000);
    });

    return () => {
      socket.off("message");
      socket.off("error");
      socket.off("history");
    };
  }, [user]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", { user, text: message });
      setMessage("");
    }
  };

  const changeUser = () => {
    const newUsername = prompt("Enter a new username:");
    if (newUsername) {
      setUser(newUsername);
      localStorage.setItem("chatUser", newUsername);
      socket.emit("join", newUsername);
      setMessages([]);
    } else {
      alert("Name not changed.");
    }
  };

  if (!user) {
    return <div className="p-5">Loading...</div>;
  }

  return (
    <div className="p-5 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Chat</h1>
        <div>
          <span className="text-gray-600 mr-2">You: {user}</span>
          <button
            onClick={changeUser}
            className="px-2 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Change User
          </button>
        </div>
      </div>
      <div className="h-[400px] overflow-y-auto border border-gray-300 p-4 rounded-lg bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <strong className="text-blue-600">{msg.user}</strong>{" "}
            <span className="text-gray-500 text-sm">
              ({new Date(msg.timestamp).toLocaleTimeString()}):
            </span>{" "}
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter a message..."
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default App;
