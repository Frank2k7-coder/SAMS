import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
import "./Chat.css";

const socket = io("http://localhost:5000", { transports: ["websocket"] });

function timeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diff = (now - then) / 1000;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (diff < 60) return rtf.format(-Math.floor(diff), "second");
  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), "minute");
  if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), "hour");
  if (diff < 604800) return rtf.format(-Math.floor(diff / 86400), "day");
  return rtf.format(-Math.floor(diff / 604800), "week");
}

function Chat() {
  const navigate = useNavigate();
  const [adminsWithUnread, setAdminsWithUnread] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [focus, setFocus] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textRef = useRef(null);
  const scrollRef = useRef(null);
  const [userProfiles,setUserProfiles]=useState({});
  const [isTyping, setIsTyping]= useState(false);
  const [typingUser, setTypingUser] = useState([]);
  const typingTimeoutRef= useRef(null);
  const storedAdmin = sessionStorage.getItem("admin");
  const admin = storedAdmin ? JSON.parse(storedAdmin) : null;
  const myId = admin?.id;

useEffect(() => {
  const admin = sessionStorage.getItem("admin");
  if (!admin) {
    navigate("/Login");
  }
}, []); 
  

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // kuzana profile of the user to the fronted
useEffect(() => {
  fetchAllProfiles();
}, []);
const fetchAllProfiles = async () => {
  try {
    const res = await fetch(`http://localhost:5000/profiles?exclude=${myId}`)
      if (!res.ok) throw new Error("Failed to fetch profiles");
    const data = await res.json();
      console.log("Profiles response:", data);

    // Map admin IDs to profile images
    const profilesMap = {};
    data.forEach(profile => {
      if (profile.user_id && profile.image_url) {
        profilesMap[profile.user_id] = profile.image_url;
      }
    });

    setUserProfiles(profilesMap);
  } catch (err) {
    console.error("Failed to fetch profiles:", err);
  }
};


  const handleSend = async () => {
    if (!selectedUser || (!input.trim() && !selectedFile)) return;

    let messageContent = input.trim();
    let is_file = false;

    // niba ar file transform it into base 64 in order to be send and managed easily

    if (selectedFile) {
      try {
        // uko bahindura mur base 64
        const base64String = await fileToBase64(selectedFile);
        messageContent = base64String;
        is_file = true;
      } catch (err) {
        console.error("File conversion failed:", err);
        alert("Failed to process file");
        return;
      }
    }

    // gutegura amakuru kuyohereza kue socket
    const messageData = {
      sender_id: myId,
      receiver_id: selectedUser.id,
      message: messageContent,
      is_file: is_file,
      timestamp: new Date().toISOString(),
      file_name: selectedFile ? selectedFile.name : null,
      file_type: selectedFile ? selectedFile.type : null
    };

    // Update local messages state immediately
    setMessages((prev) => ({
      ...prev,
      [selectedUser.id]: [
        ...(prev[selectedUser.id] || []),
        {
          sender: "Me",
          text: selectedFile ? URL.createObjectURL(selectedFile) : messageContent,
          timestamp: messageData.timestamp,
          is_file: is_file,
          file_name: selectedFile ? selectedFile.name : null,
          file_type: selectedFile ? selectedFile.type : null
        },
      ],
    }));

    // Send message through socket
    socket.emit("sendMessage", messageData);

    setInput("");
    setSelectedFile(null);
    setFocus(focus + 1);
  };
  
  
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };


  const renderMessageContent = (msg) => {
    if (msg.is_file && typeof msg.text === 'string' && msg.text.startsWith('data:')) {
      // It's a base64 file
      if (msg.file_type && msg.file_type.startsWith('image/')) {
        return <img src={msg.text} alt="attachment" className="chat-image" />;
      } else {
        return (
          <a href={msg.text} download={msg.file_name || 'file'} className="file-download">
            📎 {msg.file_name || 'Download File'}
          </a>
        );
      }
    } else if (msg.is_file) {
      // It's a file path/URL (from database)
      if (msg.text.endsWith('.jpg') || msg.text.endsWith('.png') || msg.text.endsWith('.jpeg') || msg.text.endsWith('.gif')) {
        return <img src={msg.text} alt="attachment" className="chat-image" />;
      } else {
        return (
          <a href={msg.text} target="_blank" rel="noopener noreferrer" className="file-download">
            📎 Download Attachment
          </a>
        );
      }
    } else {
      // Regular text message
      return msg.text;
    }
  };

  const fetchAdminsWithUnread = async () => {
    try {
      setIsLoading(true);
      const adminRes = await fetch(`http://localhost:5000/admins?excludeId=${myId}`);
      const adminsData = await adminRes.json();

      const merged = adminsData.map((a) => ({ ...a, unreadCount: 0 }));
      setAdminsWithUnread(merged);
      setError("");
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminsWithUnread();
  }, [myId]);

  useEffect(() => {  
  if (!selectedUser) return;

  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/messages/${admin.username}/${selectedUser.username}`,
        { method: "GET" }
      );

      // ✅ Check if response is OK
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      // ✅ Check if data is an array before using .map()
      if (!Array.isArray(data)) {
        console.error("Expected array but got:", data);
        setMessages((prev) => ({
          ...prev,
          [selectedUser.id]: [] // Set to empty array
        }));
        return;
      }

      setMessages((prev) => ({
        ...prev,
        [selectedUser.id]: data.map((msg) => ({
          sender: msg.sender_id === myId ? "Me" : "Them",
          text: msg.message,
          timestamp: msg.timestamp,
          is_file: msg.is_file,
        })),
      }));

    } catch (err) {
      console.error("Failed to fetch messages:", err);
      // Set empty messages on error
      setMessages((prev) => ({
        ...prev,
        [selectedUser.id]: []
      }));
    }
  };

  const markAsRead = async () => {
    try {
      await fetch(`http://localhost:5000/messages/mark-as-read/${selectedUser.id}/${myId}`, {
        method: "PUT",
      });

      setAdminsWithUnread((prev) =>
        prev.map((a) => (a.id === selectedUser.id ? { ...a, unreadCount: 0 } : a))
      );
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  const runChatOperations = async () => {
    await markAsRead();  
    await fetchMessages();
  };

  runChatOperations();
}, [selectedUser, admin.username, myId]);

  useEffect(() => {
    if (textRef.current) textRef.current.focus();
  }, [focus]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

    const handleTypingStart = () => {
  if (!selectedUser) return;

  console.log("🟡 Typing started to:", selectedUser.id);
  socket.emit('typing-start', {
    receiverId: selectedUser.id,
    senderId: myId,
    senderName: admin?.username || "User" // Add sender name for display
  });
};

const handleTypingStop = () => {
  if (!selectedUser) return;

  console.log("🔴 Typing stopped to:", selectedUser.id);
  socket.emit('typing-stop', {
    receiverId: selectedUser.id,
    senderId: myId
  });
};

const handleInputChange = (e) => {
  const value = e.target.value;
  setInput(value);

  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }


  if (value.trim() && !isTyping) {
    setIsTyping(true);
    handleTypingStart();
  }


  typingTimeoutRef.current = setTimeout(() => {
    if (isTyping) {
      setIsTyping(false);
      handleTypingStop();
    }
  }, 1000);
};

useEffect(() => {
  return () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      handleTypingStop();
    }
  };
}, [isTyping, selectedUser]);

useEffect(() => {
  if (isTyping) {
    handleTypingStop();
    setIsTyping(false);
  }
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }
}, [selectedUser]);


  const isUserOnline = (userId) => {
  const userIdStr = userId.toString();
  return onlineUsers.some(onlineId => 
    onlineId.toString() === userIdStr
  );
};

useEffect(() => {
  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    socket.emit("get-online-users");
  });

  socket.on("online-users", (userIds) => {
  
    const normalizedIds = userIds.map(id => id.toString());
    setOnlineUsers(normalizedIds);
    console.log("Initial online users:", normalizedIds);
  });

  socket.on("user-online", (userId) => {
    const userIdStr = userId.toString();
    setOnlineUsers((prev) => [...new Set([...prev, userIdStr])]);
    console.log(`🟢 User ${userIdStr} came online`);
  });

  socket.on("user-offline", (userId) => {
    const userIdStr = userId.toString();
    setOnlineUsers((prev) => prev.filter((id) => id !== userIdStr));
    console.log(`🔴 User ${userIdStr} went offline`);
  });
    socket.on("receiveMessage", (data) => {
      const { sender_id, receiver_id, message, timestamp, is_file } = data;
      const otherUserId = sender_id === myId ? receiver_id : sender_id;

      setMessages((prev) => ({
        ...prev,
        [otherUserId]: [
          ...(prev[otherUserId] || []),
          {
            sender: sender_id === myId ? "Me" : "Them",
            text: message,
            timestamp,
            is_file: is_file || false,
          },
        ],
      }));
    });

    socket.on("unreadUpdate", (data) => {
      const { from, count } = data;
      setAdminsWithUnread((prev) =>
        prev.map((admin) =>
          admin.id === from ? { ...admin, unreadCount: count } : admin
        )
      );
    });
 
socket.on("user-typing", (data) => {
  setTypingUser(prev => [...prev.filter(u => u.userId !== data.userId), data]);
});

socket.on("user-stopped-typing", (data) => {
  setTypingUser(prev => prev.filter(u => u.userId !== data.userId));
});

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("online-users");
      socket.off("user-online");
      socket.off("user-offline");
      socket.off("receiveMessage");
      socket.off("unreadUpdate");
    };
  }, [myId]);

  return (
 <div className="chat-container">
  <div className="sidebar">
    <h3>Security Team</h3>
    {isLoading && <p>Loading...</p>}
    {error && <p className="error">{error}</p>}
    <ul>
      {adminsWithUnread.map((a) => (
        <li
          key={a.id}
          className={selectedUser?.id === a.id ? "active" : ""}
          onClick={() => {
            setSelectedUser(a);
            setFocus(focus + 1);
          }}
        >
      
{userProfiles[a.id] && ( 
  <img 
    src={userProfiles[a.id]}  
    alt="Profile" 
    className="sidebar-profile-pic"
  />
)}
          {a.username}  


          <div style={{ fontSize: "0.9em", marginTop: "4px" }}>
            {isUserOnline(a.id) ? (
              <span style={{ color: "green" }}>🟢 Online</span>
            ) : (
              <span style={{ color: "gray" }}>⚫ Offline</span>
            )}
          </div>

          {a.unreadCount > 0 && (
            <span className="unread-badge">{a.unreadCount}</span>
          )}
        </li>
      ))}
    </ul>
  </div>

      <div className="chat-area">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h4>Chat with {selectedUser.username}</h4>
              {selectedFile && (
                <div className="selected-file">
                  📎 {selectedFile.name}
                  <button onClick={() => setSelectedFile(null)}>×</button>
                </div>
              )}
            </div>

            <div className="chat-messages">
              {(messages[selectedUser.id] || []).map((msg, i) => (
                <div key={i} className={`message ${msg.sender === "Me" ? "me" : "them"}`}>
                  <div className="message-text">
                    {renderMessageContent(msg)}
                  </div>
                  <div className="message-time">{timeAgo(msg.timestamp)}</div>
                </div>
              ))}
             
{typingUser
  .filter(user => user.userId === selectedUser.id)
  .map(user => (
    <div key={user.userId} className="typing-indicator">
      <span> {selectedUser.username} is typing...</span>
    </div>
  ))
}
              <div ref={scrollRef}></div>
            </div>

            <div className="chat-input">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="emoji-btn"
              >
                😀
              </button>

              {showEmojiPicker && (
                <div className="emoji-picker">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}

              <input 
                type="file" 
                name="file"
                className="file-input"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />

              <textarea
                type="text"
                placeholder="Type a message..."
                value={input}
                ref={textRef}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-chat">Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
}

export default Chat;