import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

function Sidebar() {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages
  } = useContext(ChatContext);

  const { logout, onlineUser } = useContext(AuthContext);

  const [input, setInput] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch users once on mount
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = input
    ? users.filter(user =>
        user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : users;

  return (
    <div className={`bg-[#818582]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? "max-md:hidden" : ""}`}>
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />

          <div className="relative py-2 group">
            <img src={assets.menu_icon} alt="Menu" className="max-h-5 cursor-pointer" />
            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 hidden group-hover:block">
              <p onClick={() => navigate("/profile")} className="cursor-pointer text-sm">
                Edit Profile
              </p>
              <hr className="my-2 border-gray-500" />
              <p onClick={logout} className="cursor-pointer text-sm">
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 px-4 py-3 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Search User..."
            className="bg-transparent outline-none text-sm text-white flex-1"
          />
        </div>

        {/* Users */}
        <div className="flex flex-col mt-4">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => {setSelectedUser(user); setUnseenMessages(prev=>(
                {...prev, [user._id]:0}
              ))}}
              className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer ${
                selectedUser?._id === user._id ? "bg-[#282142]/50" : ""
              }`}
            >
              <img
                src={user.profilePic || assets.avatar_icon}
                className="w-[35px] rounded-full"
                alt=""
              />
              <div>
                <p>{user.fullName}</p>
                {onlineUser.includes(user._id) ? (
                  <span className="text-green-400 text-xs">Online</span>
                ) : (
                  <span className="text-gray-400 text-xs">Offline</span>
                )}
              </div>

              {unseenMessages[user._id] > 0 && (
                <span className="absolute right-4 top-4 bg-violet-500 text-xs h-5 w-5 flex items-center justify-center rounded-full">
                  {unseenMessages[user._id]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
