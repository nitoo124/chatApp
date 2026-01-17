import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import axios from "axios";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [loading, setLoading] = useState(false);

  const { socket, authUser } = useContext(AuthContext);

  // Fetch all users
  const getUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.get("/api/messages/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUsers(data.user || []);
        setUnseenMessages(data.unSeenMessages || {});
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for selected user
  const getMessages = async (userId) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
        setUnseenMessages(prev => ({ ...prev, [userId]: 0 }));
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (messageData) => {
    if (!selectedUser) return toast.error("No user selected");
    try {
      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
      if (data.success) setMessages(prev => [...prev, data.newMessage]);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Socket subscription
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        setMessages(prev => [...prev, { ...newMessage, seen: true }]);
        axios.put(`/api/messages/mark/${newMessage._id}`).catch(console.error);
        setUnseenMessages(prev => ({ ...prev, [newMessage.senderId]: 0 }));
      } else {
        setUnseenMessages(prev => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    };

    const handleNewMessageSent = (newMessage) => {
      if (selectedUser && newMessage.receiverId === selectedUser._id) {
        setMessages(prev => [...prev, newMessage]);
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("newMessageSent", handleNewMessageSent);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("newMessageSent", handleNewMessageSent);
    };
  }, [socket, selectedUser]);

  // Fetch users after authUser set
  useEffect(() => {
    if (authUser) getUsers();
  }, [authUser, getUsers]);

  // Fetch messages when user selected
  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
    else setMessages([]);
  }, [selectedUser]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        selectedUser,
        setSelectedUser,
        getUsers,
        getMessages,
        sendMessage,
        unseenMessages,
        setUnseenMessages,
        loading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
