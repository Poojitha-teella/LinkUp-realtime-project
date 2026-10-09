import { useEffect, useMemo, useRef, useState } from "react";
import { api, API } from "./api";

const emojis = ["❤️", "👍", "🔥"];

const moreEmojis = [
  "❤️",
  "👍",
  "🔥",
  "😂",
  "🤣",
  "😍",
  "🥰",
  "😎",
  "😮",
  "😢",
  "😡",
  "👏",
  "🎉",
  "🥳",
  "🙏",
  "💯",
  "✨",
  "🚀",
  "🙌",
  "💖",
  "👀",
  "🤔",
  "😆",
  "❤️‍🔥",
  "💀",
  "😭",
  "🤩"
];

function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      const data =
        mode === "login"
          ? await api.login(username, password)
          : await api.register(username, email, password);

      localStorage.setItem("pulse_token", data.token);
      localStorage.setItem("pulse_user", JSON.stringify(data.user));

      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    }
  }
  async function submitForgotPassword(e) {
    e.preventDefault();
    setForgotMessage("");

    try {
      const data = await api.forgotPassword(forgotEmail);
      setForgotMessage(data.message);
    } catch (err) {
      setForgotMessage(err.message);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">◉ LinkUp</div>

        <p className="eyebrow">REAL-TIME COLLABORATION</p>

        <h1>
          {mode === "login"
            ? "Welcome back."
            : "Create your space."}
        </h1>

        <p className="muted">
          Chat, react and collaborate with live presence.
        </p>

        <form onSubmit={submit}>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
          />

          {mode === "register" && (
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              required
            />
          )}

          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
          />

          {error && <div className="error">{error}</div>}

          <button className="primary">
            {mode === "login"
              ? "Enter LinkUp"
              : "Create account"}
          </button>
          {mode === "login" && (
            <button
              type="button"
              className="forgot-password"
              onClick={() => {
                setShowForgotPassword(true);
                setForgotMessage("");
              }}
            >
              Forgot password?
            </button>
          )}
        </form>
          {showForgotPassword && (
            <div className="forgot-password-overlay">
              <div className="forgot-password-box">

                <h3>Reset your password</h3>

                <p className="muted">
                  Enter the email you used to create your account.
                </p>

                <form onSubmit={submitForgotPassword}>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="Email address"
                    required
                  />

                  <button className="primary">
                    Send reset link
                  </button>
                </form>

                {forgotMessage && (
                  <div className="muted">
                    {forgotMessage}
                  </div>
                )}

                <button
                  type="button"
                  className="switch"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to login
                </button>

              </div>
            </div>
          )}

              
        <button
          className="switch"
          onClick={() =>
            setMode(
              mode === "login"
                ? "register"
                : "login"
            )
          }
        >
          {mode === "login"
            ? "New here? Create an account"
            : "Already have an account? Login"}
        </button>
      </section>
    </main>
  );
}

function Dashboard({ user, onOpenChat, onOpenChatRooms, onLogout }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("pulse_theme") || "dark";
  });

  const [showAbout, setShowAbout] = useState(false);
  const [showFeature, setShowFeature] = useState(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [guideSection, setGuideSection] = useState(null);
  const [activeGame, setActiveGame] = useState("");

 
  useEffect(() => {
    document.body.classList.toggle(
      "light-mode",
      theme === "light"
    );

    localStorage.setItem("pulse_theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) =>
      prev === "dark" ? "light" : "dark"
    );
  }


  function scrollToSection(id) {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth"
      });
  }

  function openFeature(feature) {
    setShowFeature(feature);
  }

  function closeFeature() {
    setShowFeature(null);
  }

  function openGuide(section) {
    setGuideSection(section);
  }

  function closeGuide() {
    setGuideSection(null);
  }

  const guideData = {
  account: {
    number: "01",
    title: "Login & Account",
    description:
      "Manage your LinkUp account and understand the basic account actions.",
    steps: [
      "Create an account using your username, email and password.",
      "Log in using your username and password.",
      "Your profile and username appear in the dashboard.",
      "Use Logout when you want to end your current session."
    ]
  },

  community: {
    number: "02",
    title: "Community",
    description:
      "Discover channels, request access and become part of different communities.",
    steps: [
      "Open the Chat section from your dashboard.",
      "Your joined channels appear under MY CHANNELS.",
      "Browse available channels under OTHER CHANNELS.",
      "Click + to send a join request.",
      "The channel owner can approve or reject your request.",
      "After approval, the channel appears under MY CHANNELS."
    ]
  },

  chat: {
    number: "03",
    title: "Chat",
    description:
      "Communicate with members of your channels in real time.",
    steps: [
      "Open a channel from MY CHANNELS.",
      "Previous messages appear in the chat area.",
      "Type your message in the message box.",
      "Press Enter or click Send.",
      "React to messages using the reaction button.",
      "Use Members to see people in the current channel.",
      "Channel owners can rename their channel."
    ]
  },

  games: {
    number: "04",
    title: "Games",
    description:
      "The Games area is part of the LinkUp experience and is currently being developed.",
    steps: [
      "Open Games from the Explore section.",
      "Games are currently marked as Coming Soon.",
      "The feature will become available when games are implemented.",
      "Recently played games can then appear on your dashboard."
    ]
  },

  personalize: {
    number: "05",
    title: "Personalize",
    description:
      "Choose the dashboard appearance that feels comfortable for you.",
    steps: [
      "Find the sun or moon button in the dashboard header.",
      "Click it to switch between Dark and Light mode.",
      "Your selected theme is saved in your browser.",
      "The selected theme is restored when you return."
    ]
  }
};

  return (
    <div className="dashboard-page">

      {/* HEADER */}
      <header className="dashboard-header">

        <div className="dashboard-brand">
          <span className="brand-symbol">◉</span>
          
          <span>LinkUp</span>

        </div>

        
        <nav className="dashboard-nav">
          <span className="nav-active">
            Home
          </span>

          <span
            onClick={() =>
              scrollToSection("pulse-explore")
            }
          >
            Explore
          </span>
        </nav>


        <div className="dashboard-user">

          

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <div
            className="avatar"
            style={{
              background: user.avatarColor
            }}
          >
            {user.username[0].toUpperCase()}
          </div>

          <span className="dashboard-username">
            {user.username}
          </span>

         <button 
            className="icon-btn" 
            onClick={() => {
              const confirmLogout = window.confirm(
                "Are you sure you want to log out?"
              );

              if (confirmLogout) {
                onLogout();
              }
            }} 
            title="Logout" 
          > 
            ↪ 
          </button>

        </div>
      </header>


      <main className="dashboard-content">

        {/* HERO */}
        <section className="dashboard-hero">

          <div className="hero-glow"></div>

          <div className="hero-content">

            <div className="hero-label">
              <span className="live-dot"></span>
              LINKUP IS LIVE
            </div>

            <h1>
              Welcome back,
              <br />
              <span>{user.username}</span> 👋
            </h1>

            <p>
              Your space to chat, connect,
              play and have fun with your buddies.
            </p>

            <div className="hero-actions">

              <button
                className="hero-primary"
                onClick={onOpenChat}
              >
                💬 Open Chat
                <span>→</span>
              </button>

              

            </div>
          </div>

          <div className="hero-decoration">
            <div className="orbit orbit-one"></div>
            <div className="orbit orbit-two"></div>
            <div className="orbit-core">
              ◉
            </div>
          </div>

        </section>


        


        {/* EXPLORE */}
        <div
          className="dashboard-section-title"
          id="pulse-explore"
        >
          <div>
            <span>EXPLORE</span>
            <h2>Your LinkUp</h2>
          </div>

          <p>
            Everything you need, in one place.
          </p>
        </div>


        <section className="dashboard-grid">

          {/* CHAT */}
          <button
            className="dashboard-card featured-card"
            onClick={onOpenChatRooms}
          >
            <div className="card-top">
              <div className="dashboard-card-icon">
                💬
              </div>

              <span className="card-number">
                01
              </span>
            </div>

            <div>
              <h2>Chat Rooms</h2>

              <p>
                Jump into your channels and
                continue the conversation.
              </p>
            </div>

            <span className="card-arrow">
              →
            </span>
          </button>


          {/* GAMES */}
          <button
            className="dashboard-card games-card"
            id="pulse-games"
            onClick={() =>
              openFeature("games")
            }
          >
            <div className="card-top">

              <div className="dashboard-card-icon">
                🎮
              </div>

              <span className="card-number">
                02
              </span>

            </div>

            <div>
              <h2>Games</h2>

              <p>
                Quick games, challenges and
                friendly competition.
              </p>
            </div>

            

          </button>
          
        </section>


        {/* HOW TO USE */}
        <section className="how-pulseroom">
          <div className="dashboard-section-title">
            <div>
              <span className="section-eyebrow">GET STARTED</span>
              <h2>How to use LinkUp</h2>
              <p>
                A simple guide to the features and actions available on LinkUp.
              </p>
            </div>
          </div>

          <div className="how-guide">
            {Object.entries(guideData).map(([key, item]) => (
              <button
                key={key}
                className="how-guide-row"
                onClick={() => setGuideSection(key)}
              >
                <span className="how-guide-number">
                  {item.number}
                </span>

                <span className="how-guide-content">
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>

                <span className="how-guide-arrow">
                  →
                </span>
              </button>
            ))}
          </div>
        </section>


        {/* FOOTER */}
        <footer className="dashboard-footer">

          <div>
            <span className="brand-symbol">
              ◉
            </span>

            <strong>
              LinkUp
            </strong>
          </div>

          <span>
            Chat • Connect • Play
          </span>

        </footer>

      </main>


      {/* FEATURE POPUP */}
      {showFeature && (

        <div
          className="dashboard-modal-overlay"
          onClick={closeFeature}
        >

          <div
            className="dashboard-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={closeFeature}
            >
              ×
            </button>

            
            {showFeature === "games" && (
              <div className="games-section">
                <div className="modal-icon">🎮</div>

                <span className="modal-label">LINKUP ARCADE</span>

                <h2>Choose Your Game</h2>
                <p>Take a break and challenge yourself or a friend!</p>

                <div className="games-grid">
                  <button
                    className="game-option"
                    onClick={() => setActiveGame("guess")}
                  >
                    <span className="game-emoji">🎯</span>
                    <h3>Guess the Number</h3>
                    <p>Can you find the secret number?</p>
                    <span>PLAY NOW →</span>
                  </button>

                  <button
                    className="game-option"
                    onClick={() => setActiveGame("tictactoe")}
                  >
                    <span className="game-emoji">❌⭕</span>
                    <h3>Tic-Tac-Toe</h3>
                    <p>Play against the computer or a friend.</p>
                    <span>PLAY NOW →</span>
                  </button>
                </div>

                
                {activeGame === "guess" && (
                  <div
                    className="game-overlay"
                    onClick={() => setActiveGame("")}
                  >
                    <div
                      className="game-popup"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="game-close"
                        onClick={() => setActiveGame("")}
                        aria-label="Close game"
                      >
                        ✕
                      </button>

                      <GuessNumberGame
                        onBack={() => setActiveGame("")}
                      />
                    </div>
                  </div>
                )}

                {activeGame === "tictactoe" && (
                  <div
                    className="game-overlay"
                    onClick={() => setActiveGame("")}
                  >
                    <div
                      className="game-popup"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="game-close"
                        onClick={() => setActiveGame("")}
                        aria-label="Close game"
                      >
                        ✕
                      </button>

                      <TicTacToeGame
                        onBack={() => setActiveGame("")}
                      />
                    </div>
                  </div>
                )}

              </div>
            )}


            {showFeature === "leaderboard" && (
              <>
                <div className="modal-icon">
                  🏆
                </div>

                <span className="modal-label">
                  COMING SOON
                </span>

                <h2>
                  Leaderboard
                </h2>

                <p>
                  The leaderboard feature will
                  be added when the scoring and
                  games system is implemented.
                </p>
              </>
            )}

            {showFeature === "buddies" && (
              <>
                <div className="modal-icon">
                  👥
                </div>

                <span className="modal-label">
                  COMING SOON
                </span>

                <h2>
                  Buddies
                </h2>

                <p>
                  The Buddies section is planned
                  for connecting with friends
                  inside LinkUp.
                </p>
              </>
            )}

          </div>

        </div>

      )}


      {/* GUIDE POPUP */}
      {guideSection && (

        <div
          className="dashboard-modal-overlay"
          onClick={closeGuide}
        >

          <div
            className="dashboard-modal guide-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={closeGuide}
            >
              ×
            </button>

            <div className="guide-number">
              {guideData[guideSection].number}
            </div>

            <span className="modal-label">
              HOW IT WORKS
            </span>

            <h2>
              {guideData[guideSection].title}
            </h2>

            <p className="guide-description">
              {guideData[guideSection].description}
            </p>

            <div className="guide-steps">

              {guideData[guideSection].steps.map(
                (step, index) => (

                  <div
                    className="guide-step"
                    key={index}
                  >

                    <span>
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <p>
                      {step}
                    </p>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

function ResetPassword({ token }) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const data = await api.resetPassword(token, password);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">◉ LinkUp</div>

        <p className="eyebrow">PASSWORD RESET</p>

        <h1>Set a new password.</h1>

        <p className="muted">
          Enter your new password below.
        </p>

        <form onSubmit={submit}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="New password"
            minLength={6}
            required
          />

          {error && <div className="error">{error}</div>}

          {message && (
            <div className="muted">
              {message}
            </div>
          )}

          <button className="primary">
            Reset password
          </button>
        </form>
      </section>
    </main>
  );
}

function App() {
  const [showFeature, setShowFeature] = useState("");
  const [activeGame, setActiveGame] = useState("");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("pulse_user")
      );
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState("dashboard");
  const [chatRoomId, setChatRoomId] = useState(null);
  const resetToken = window.location.pathname.startsWith("/reset-password/")
    ? window.location.pathname.split("/reset-password/")[1]
    : null;

  useEffect(() => {
    function goDashboard() {
      setPage("dashboard");
    }

    window.addEventListener(
      "go-dashboard",
      goDashboard
    );

    return () => {
      window.removeEventListener(
        "go-dashboard",
        goDashboard
      );
    };
  }, []);

  function logout() {
    localStorage.clear();
    setUser(null);
    setPage("dashboard");
  }

  if (resetToken) {
    return <ResetPassword token={resetToken} />;
  }

  if (!user) {
    return <Auth onAuth={setUser} />;
  }

  if (page === "chat") {
    return (
      <Chat
        user={user}
        onLogout={logout}
        initialRoomId={chatRoomId}
      />
    );
  }

  if (page === "chat-rooms") {
    return (
      <ChatRooms
        user={user}
        onBack={() => setPage("dashboard")}
        onOpenChat={roomId => {
          setChatRoomId(roomId);
          setPage("chat");
        }}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onOpenChat={() => {
        const lastRoom =
          localStorage.getItem("pulse_last_room");

        setChatRoomId(lastRoom || null);
        setPage("chat");
      }}
      onOpenChatRooms={() => {
        setPage("chat-rooms");
      }}
      onLogout={logout}
    />
  );
}

function ChatRooms({ user, onBack, onOpenChat }) {
  const [mode, setMode] = useState("home");
  const [rooms, setRooms] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [requestedRooms, setRequestedRooms] = useState([]);

  async function loadRooms() {
    try {
      const data = await api.rooms();
      setRooms(data);
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    loadRooms();
  }, []);

  async function createChannel(e) {
    e.preventDefault();

    const name = channelName.trim();

    if (!name) {
      alert("Please enter a channel name.");
      return;
    }

    try {
      const newRoom = await api.createRoom(name);

      localStorage.setItem(
        "pulse_last_room",
        newRoom._id
      );

      onOpenChat(newRoom._id);
    } catch (error) {
      alert(error.message);
    }
  }

  async function requestToJoin(roomId) {
    try {
      await api.requestToJoin(roomId);

      setRequestedRooms(prev =>
        prev.includes(roomId)
          ? prev
          : [...prev, roomId]
      );

      alert("Join request sent to the channel owner.");
    } catch (error) {
      alert(error.message);
    }
  }

  if (mode === "create") {
    return (
      <div className="room-hub-page">

        <div className="room-hub-top">
          <button
            className="room-hub-back"
            onClick={() => setMode("home")}
          >
            ← Chat Rooms
          </button>

          <button
            className="room-hub-dashboard"
            onClick={onBack}
          >
            Dashboard
          </button>
        </div>

        <div className="room-hub-create">

          <span className="room-hub-eyebrow">
            CREATE A CHANNEL
          </span>

          <h1>Create your channel</h1>

          <p>
            Create a new community space and become its owner.
          </p>

          <form
            className="create-channel-form"
            onSubmit={createChannel}
          >
            <label htmlFor="channel-name">
              Channel name
            </label>

            <input
              id="channel-name"
              type="text"
              value={channelName}
              onChange={e =>
                setChannelName(e.target.value)
              }
              placeholder="e.g. Web Development"
              maxLength={40}
              autoFocus
            />

            <button
              type="submit"
              className="create-channel-submit"
            >
              Create Channel
              <span>→</span>
            </button>
          </form>

        </div>
      </div>
    );
  }

  if (mode === "join") {
    const myRooms = rooms.filter(room =>
      room.members?.some(
        member =>
          (member._id || member).toString() ===
          user.id.toString()
      )
    );

    const availableRooms = rooms.filter(room =>
      !room.members?.some(
        member =>
          (member._id || member).toString() ===
          user.id.toString()
      )
    );

    return (
      <div className="room-hub-page">

        <div className="room-hub-top">
          <button
            className="room-hub-back"
            onClick={() => setMode("home")}
          >
            ← Chat Rooms
          </button>

          <button
            className="room-hub-dashboard"
            onClick={onBack}
          >
            Dashboard
          </button>
        </div>

        <div className="room-list-page">

          <div className="room-list-heading">
            <span className="room-hub-eyebrow">
              JOIN A CHANNEL
            </span>

            <h1>Find your community</h1>

            <p>
              Choose a channel and send a request to join.
            </p>
          </div>

          {myRooms.length > 0 && (
            <div className="room-list-section">

              <div className="room-list-label">
                MY CHANNELS
              </div>

              <div className="room-hub-list">

                {myRooms.map(room => (
                  <button
                    key={room._id}
                    className="room-hub-room"
                    onClick={() => onOpenChat(room._id)}
                  >
                    <span className="room-hub-room-icon">
                      #
                    </span>

                    <span className="room-hub-room-info">
                      <strong>{room.name}</strong>

                      <small>
                        {room.members?.length || 0} members
                      </small>
                    </span>

                    <span className="room-hub-room-arrow">
                      →
                    </span>
                  </button>
                ))}

              </div>
            </div>
          )}

          <div className="room-list-section">

            <div className="room-list-label">
              AVAILABLE CHANNELS
            </div>

            {availableRooms.length === 0 ? (
              <div className="room-empty">
                <span>◌</span>
                <strong>No other channels yet</strong>
                <p>
                  Create a new channel and start your own community.
                </p>
              </div>
            ) : (
              <div className="room-hub-list">

                {availableRooms.map(room => {
                  const requested =
                    requestedRooms.includes(room._id);

                  return (
                    <div
                      className="room-hub-room"
                      key={room._id}
                    >

                      <span className="room-hub-room-icon">
                        #
                      </span>

                      <span className="room-hub-room-info">
                        <strong>{room.name}</strong>

                        <small>
                          {room.members?.length || 0} members
                        </small>
                      </span>

                      {requested ? (
                        <span className="room-requested">
                          Requested ✓
                        </span>
                      ) : (
                        <button
                          className="room-request-button"
                          onClick={() =>
                            requestToJoin(room._id)
                          }
                        >
                          Join
                        </button>
                      )}

                    </div>
                  );
                })}

              </div>
            )}

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="room-hub-page">

      <div className="room-hub-top">

        <button
          className="room-hub-back"
          onClick={onBack}
        >
          ← Dashboard
        </button>

        <span className="room-hub-brand">
          ◉ LinkUp
        </span>

      </div>

      <div className="room-hub-content">

        <div className="room-hub-heading">

          <span className="room-hub-eyebrow">
            CHAT ROOMS
          </span>

          <h1>Find your space.</h1>

          <p>
            Create a new channel or discover communities
            already growing on LinkUp.
          </p>

        </div>

        <div className="room-hub-options">

          <button
            className="room-hub-option create-option"
            onClick={() => setMode("create")}
          >
            <span className="room-option-icon">
              +
            </span>

            <span>
              <strong>Create a Channel</strong>

              <small>
                Start a new community and become its owner.
              </small>
            </span>

            <b>→</b>
          </button>


          <button
            className="room-hub-option join-option"
            onClick={() => setMode("join")}
          >
            <span className="room-option-icon">
              ◌
            </span>

            <span>
              <strong>Join a Channel</strong>

              <small>
                Discover channels and request to join.
              </small>
            </span>

            <b>→</b>
          </button>

        </div>

      </div>

    </div>
  );
}

function Chat({ user, onLogout, initialRoomId }) {
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [requestedRooms, setRequestedRooms] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [editingChannel, setEditingChannel] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [text, setText] = useState("");
  const [typing, setTyping] = useState([]);
  const [connected, setConnected] = useState(false);
  const [newRoom, setNewRoom] = useState("");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] =
    useState(null);

  const wsRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  const currentRoomUsers = useMemo(
    () => users,
    [users]
  );

  async function loadRooms() {
    const data = await api.rooms();

    setRooms(data);

    if (room) return;

    if (initialRoomId) {
      const initialRoom = data.find(
        r => r._id === initialRoomId
      );

      if (initialRoom) {
        selectRoom(initialRoom);
        return;
      }
    }

    if (data[0]) {
      selectRoom(data[0]);
    }
  }

  async function requestToJoin(roomId) {
    try {
      await api.requestToJoin(roomId);

      setRequestedRooms(prev => [
        ...prev,
        roomId
      ]);

      alert("Join request sent to the channel admin.");
    } catch (error) {
      alert(error.message);
    }
  }

  async function loadJoinRequests() {
    try {
      const requests = await api.joinRequests();
      console.log("JOIN REQUESTS:", requests);

      setJoinRequests(requests);
    } catch (error) {
      console.error("Failed to load join requests:", error);
    }
  }

  async function approveJoinRequest(requestId) {
    try {
      await api.approveJoinRequest(requestId);

      // Remove the approved request from the pending list
      setJoinRequests(prev =>
        prev.filter(request => request._id !== requestId)
      );

      // Refresh channels
      await loadRooms();

      alert("Join request approved.");
    } catch (error) {
      alert(error.message);
    }
  }

  async function rejectJoinRequest(requestId) {
    try {
      await api.rejectJoinRequest(requestId);

      // Remove the rejected request from the pending list
      setJoinRequests(prev =>
        prev.filter(request => request._id !== requestId)
      );

      alert("Join request rejected.");
    } catch (error) {
      alert(error.message);
    }
  }

  async function selectRoom(nextRoom) {
  try {
    

    const updatedRoom = await api.roomMembers(nextRoom._id);
    const history = await api.messages(nextRoom._id);

    setRoom(updatedRoom);

    setRooms(prev =>
      prev.map(r =>
        r._id === updatedRoom._id ? updatedRoom : r
      )
    );

    setMessages(
      history.map(m => ({
        ...m,
        id: m._id,
        reactions: Object.fromEntries(
          Object.entries(m.reactions || {}).map(([key, value]) => [
            key,
            value.length
          ])
        )
      }))
    );

    setShowMembers(false);

    localStorage.setItem("pulse_last_room", nextRoom._id);

    wsRef.current?.send(
      JSON.stringify({
        type: "join_room",
        roomId: nextRoom._id
      })
    );
  } catch (e) {
    alert(e.message);
  }
}

  useEffect(() => {
    loadRooms();
    loadJoinRequests();

    const token =
      localStorage.getItem("pulse_token");

    let stopped = false;

    function connect() {
      if (stopped) return;

      const ws = new WebSocket(
        `${API.replace(
          /^http/,
          "ws"
        )}/?token=${encodeURIComponent(token)}`
      );

      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);

        if (room) {
          ws.send(
            JSON.stringify({
              type: "join_room",
              roomId: room._id
            })
          );
        }
      };

      ws.onmessage = e => {
        const event = JSON.parse(e.data);

        if (event.type === "message") {
          setMessages(prev => [
            ...prev,
            {
              ...event.message,
              id:
                event.message.id ||
                event.message._id
            }
          ]);
        }

        if (event.type === "presence") {
          setUsers(event.users);
        }
        if (event.type === "global_presence") {
          setAllUsers(event.users);
        }

        if (event.type === "typing") {
          setTyping(prev =>
            event.isTyping
              ? [
                  ...new Set([
                    ...prev,
                    event.username
                  ])
                ]
              : prev.filter(
                  name =>
                    name !== event.username
                )
          );
        }

        if (event.type === "reaction") {
          setMessages(prev =>
            prev.map(m =>
              m.id === event.messageId
                ? {
                    ...m,
                    reactions: {
                      ...(m.reactions || {}),
                      [event.emoji]:
                        event.count
                    }
                  }
                : m
            )
          );
        }
      };

      ws.onclose = () => {
        setConnected(false);

        if (!stopped) {
          setTimeout(connect, 1500);
        }
      };
    }

    connect();

    return () => {
      stopped = true;
      wsRef.current?.close();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, typing]);

  function send() {
    const value = text.trim();

    if (
      !value ||
      !room ||
      wsRef.current?.readyState !==
        WebSocket.OPEN
    ) {
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "message",
        roomId: room._id,
        text: value
      })
    );

    setText("");

    wsRef.current.send(
      JSON.stringify({
        type: "typing",
        roomId: room._id,
        isTyping: false
      })
    );
  }

  function handleTyping(e) {
    setText(e.target.value);

    if (
      !room ||
      wsRef.current?.readyState !==
        WebSocket.OPEN
    ) {
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "typing",
        roomId: room._id,
        isTyping: true
      })
    );

    clearTimeout(typingTimer.current);

    typingTimer.current = setTimeout(() => {
      wsRef.current?.send(
        JSON.stringify({
          type: "typing",
          roomId: room._id,
          isTyping: false
        })
      );
    }, 900);
  }

  function react(messageId, emoji) {
    wsRef.current?.send(
      JSON.stringify({
        type: "reaction",
        roomId: room._id,
        messageId,
        emoji
      })
    );
  }

  async function createRoom(e) {
    e.preventDefault();

    if (!newRoom.trim()) return;

    try {
      const created =
        await api.createRoom(
          newRoom.trim()
        );

      setRooms(prev => [
        created,
        ...prev
      ]);

      setNewRoom("");

      selectRoom(created);
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="app-shell">

      <aside className="sidebar">
        <div className="chat-brand">
          <button
            className="back-dashboard"
            onClick={() => window.dispatchEvent(new Event("go-dashboard"))}
          >
            ← Dashboard
          </button>

          <div className="brand">
            ◉ LinkUp
          </div>
        </div>

        <div className="profile">
          <div
            className="avatar"
            style={{
              background:
                user.avatarColor
            }}
          >
            {user.username[0].toUpperCase()}
          </div>

          <div>
            <b>{user.username}</b>

            <small>
              <span
                className={
                  connected
                    ? "dot online"
                    : "dot"
                }
              />

              {connected
                ? "Live"
                : "Reconnecting..."}
            </small>
          </div>

          <button
            className="icon-btn"
            onClick={() => setShowLeaveConfirm(true)}
          >
            ↪
          </button>
        </div>

        {(() => {
          const myRooms = rooms.filter(r =>
            r.members?.some(
              member =>
                (member._id || member).toString() ===
                user.id.toString()
            )
          );

          const otherRooms = rooms.filter(r =>
            !r.members?.some(
              member =>
                (member._id || member).toString() ===
                user.id.toString()
            )
          );

          return (
            <>
              <div className="side-title">
                MY CHANNELS
                <span>{myRooms.length}</span>
              </div>

              <div className="rooms">
                {myRooms.map(r => (
                  <button
                    key={r._id}
                    className={`room ${
                      room?._id === r._id ? "active" : ""
                    }`}
                    onClick={() => selectRoom(r)}
                  >
                    {r.name}
                  </button>
                ))}
              </div>

              <div className="side-title other-channels-title">
                OTHER CHANNELS
                <span>{otherRooms.length}</span>
              </div>

              <div className="rooms">
                {otherRooms.map(r => {
                  const requested =
                    requestedRooms.includes(r._id);

                  return (
                    <div
                      className="other-channel"
                      key={r._id}
                    >
                      <span className="room-other-name">
                        {r.name}
                      </span>

                      {requested ? (
                        <span className="requested">
                          ✓
                        </span>
                      ) : (
                        <button
                          className="join-channel-button"
                          onClick={() =>
                            requestToJoin(r._id)
                          }
                          title="Request to join"
                        >
                          +
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}

        <button
          className="see-requests-button"
          onClick={() => setShowJoinRequests(true)}
        >
          <span>🔔</span>
          See Join Requests
          <b>{joinRequests.length}</b>
        </button>

        <form
          className="new-room"
          onSubmit={createRoom}
        >
          <input
            value={newRoom}
            onChange={e =>
              setNewRoom(
                e.target.value
              )
            }
            placeholder="New channel..."
          />

          <button>+</button>
        </form>
      </aside>

      <main className="chat">

        {room ? (
          <>
              <header className="chat-header">

                <div className="header-left">
                  <div>
                    {editingChannel ? (
                      <div className="channel-edit">
                        <input
                          value={channelName}
                          onChange={e => setChannelName(e.target.value)}
                          onKeyDown={async e => {
                            if (e.key === "Enter") {
                              const newName = channelName.trim();
                              if (!newName) return;

                              try {
                                const updated = await api.renameRoom(
                                  room._id,
                                  newName
                                );

                                setRoom(updated);

                                setRooms(prev =>
                                  prev.map(r =>
                                    r._id === updated._id
                                      ? { ...r, name: updated.name }
                                      : r
                                  )
                                );

                                setEditingChannel(false);
                              } catch (err) {
                                alert(err.message);
                              }
                            }

                            if (e.key === "Escape") {
                              setEditingChannel(false);
                            }
                          }}
                          autoFocus
                        />

                        <button onClick={() => setEditingChannel(false)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="room-name">
                        {room.name}
                      </div>
                    )}

                    <small>{users.length} people online</small>
                  </div>

                  {room.owner?._id === user.id && !editingChannel && (
                    <button
                      className="edit-channel-button"
                      onClick={() => {
                        setChannelName(room.name);
                        setEditingChannel(true);
                      }}
                    >
                      ✎
                    </button>
                  )}
                </div>

                <button
                  className="members-button"
                  onClick={() => setShowMembers(prev => !prev)}
                >
                  👥 Members
                </button>

              </header>
            
                {showMembers && (
                  <div className="members-popup">
                    <div className="members-popup-header">
                      <b>#{room.name} Members</b>

                      <button onClick={() => setShowMembers(false)}>
                        ×
                      </button>
                    </div>

                    {room.members?.length ? (
                      room.members.map(member => {
                        const online = users.some(
                          u => u.id === member._id
                        );

                        return (
                          <div className="member" key={member._id}>
                            <div
                              className="avatar small"
                              style={{ background: member.avatarColor }}
                            >
                              {member.username[0].toUpperCase()}
                            </div>

                            <span>{member.username}</span>

                            <small className={online ? "online-text" : "offline-text"}>
                              {online ? "Online" : "Offline"}
                            </small>
                          </div>
                        );
                      })
                    ) : (
                      <p>No members yet.</p>
                    )}
                  </div>
                )}

            <section className="messages">

              {messages.length === 0 && (
                <div className="empty">
                  <div className="empty-icon">
                    ✦
                  </div>

                  <h2>
                    Welcome to {room.name}
                  </h2>

                  <p>
                    Start the
                    conversation.
                    Messages appear
                    here instantly.
                  </p>
                </div>
              )}

              {messages.map((m, i) => {

                const mine =
                  m.userId === user.id ||
                  m.userId?.toString() ===
                    user.id?.toString();

                const hasAnyReaction =
                  Object.values(
                    m.reactions || {}
                  ).some(
                    count => count > 0
                  );

                return (
                  <article
                    className={`message ${
                      mine ? "mine" : ""
                    }`}
                    key={m.id || i}
                  >

                    <div className="avatar small">
                      {m.username[0].toUpperCase()}
                    </div>

                    <div className="bubble-wrap">

                      <div className="meta">
                        <b>
                          {m.username}
                        </b>

                        <span>
                          {new Date(
                            m.createdAt
                          ).toLocaleTimeString(
                            [],
                            {
                              hour:
                                "2-digit",
                              minute:
                                "2-digit"
                            }
                          )}
                        </span>
                      </div>

                      <div className="bubble">
                        {m.text}
                      </div>

                      {/* REACTIONS */}
                      <div className="reactions">

                        {/* Before any reaction:
                            ❤️ 👍 + */}

                        {!hasAnyReaction && (
                          <>
                            <button
                              onClick={() =>
                                react(
                                  m.id,
                                  "❤️"
                                )
                              }
                            >
                              ❤️
                            </button>

                            <button
                              onClick={() =>
                                react(
                                  m.id,
                                  "👍"
                                )
                              }
                            >
                              👍
                            </button>
                          </>
                        )}

                        {/* After a reaction:
                            show only selected emojis */}

                        {hasAnyReaction &&
                          Object.entries(
                            m.reactions ||
                              {}
                          ).map(
                            ([
                              emoji,
                              count
                            ]) => {
                              if (
                                !count ||
                                count === 0
                              ) {
                                return null;
                              }

                              return (
                                <button
                                  key={emoji}
                                  onClick={() =>
                                    react(
                                      m.id,
                                      emoji
                                    )
                                  }
                                >
                                  {emoji}{" "}
                                  <span>
                                    {count}
                                  </span>
                                </button>
                              );
                            }
                          )}

                        {/* PLUS BUTTON */}
                        <button
                          className="emoji-plus"
                          onClick={() =>
                            setShowEmojiPicker(
                              showEmojiPicker ===
                                m.id
                                ? null
                                : m.id
                            )
                          }
                        >
                          +
                        </button>

                        {/* EMOJI PICKER */}
                        {showEmojiPicker ===
                          m.id && (
                          <div className="emoji-picker">

                            {moreEmojis.map(
                              emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => {
                                    react(
                                      m.id,
                                      emoji
                                    );

                                    setShowEmojiPicker(
                                      null
                                    );
                                  }}
                                >
                                  {emoji}
                                </button>
                              )
                            )}

                          </div>
                        )}

                      </div>
                    </div>
                  </article>
                );
              })}

              {typing.length > 0 && (
                <div className="typing">
                  {typing.join(", ")}{" "}
                  {typing.length === 1
                    ? "is"
                    : "are"}{" "}
                  typing
                  <span>•••</span>
                </div>
              )}

              <div ref={bottomRef} />

            </section>

            <footer className="composer">

              <input
                value={text}
                onChange={handleTyping}
                onKeyDown={e =>
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  (
                    e.preventDefault(),
                    send()
                  )
                }
                placeholder={`Message ${room.name}`}
              />

              <button
                className="send"
                onClick={send}
              >
                Send ↗
              </button>

            </footer>
          </>
        ) : (
          <div className="empty">
            <h2>
              Create your first room
            </h2>
          </div>
        )}

      </main>

      <aside className="members">
        <div className="members-title">
          ALL USERS — {allUsers.length}
        </div>

        <div className="status-title">
          ONLINE — {allUsers.filter(u => u.online).length}
        </div>

        {allUsers
          .filter(u => u.online)
          .map(u => (
            <div className="member" key={u.id}>
              <div
                className="avatar small"
                style={{ background: u.avatarColor }}
              >
                {u.username[0].toUpperCase()}
              </div>

              <span>{u.username}</span>

              <i className="online-dot" />
            </div>
          ))}

        <div className="status-title">
          OFFLINE — {allUsers.filter(u => !u.online).length}
        </div>

        {allUsers
          .filter(u => !u.online)
          .map(u => (
            <div className="member offline" key={u.id}>
              <div
                className="avatar small"
                style={{ background: u.avatarColor }}
              >
                {u.username[0].toUpperCase()}
              </div>

              <span>{u.username}</span>

              <i className="offline-dot" />
            </div>
          ))}
      </aside>

          {showJoinRequests && (
            <div className="join-requests-overlay">
              <div className="join-requests-popup">
                <div className="join-requests-header">
                  <div>
                    <span>JOIN REQUESTS</span>
                    <h3>People waiting to join</h3>
                  </div>

                  <button
                    onClick={() =>
                      setShowJoinRequests(false)
                    }
                  >
                    ×
                  </button>
                </div>

                <div className="join-requests-list">
                  {joinRequests.map(request => (
                    <div
                      className="join-request-card"
                      key={request._id}
                    >
                      <div className="join-request-user">
                        <div
                          className="avatar small"
                          style={{
                            background:
                              request.user?.avatarColor
                          }}
                        >
                          {request.user?.username?.[0]?.toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {request.user?.username}
                          </strong>

                          <small>
                            Wants to join #
                            {request.room?.name}
                          </small>
                        </div>
                      </div>

                      <div className="join-request-actions">
                        <button
                          className="approve-request"
                          onClick={() =>
                            approveJoinRequest(request._id)
                          }
                        >
                          ✓ Accept
                        </button>

                        <button
                          className="reject-request"
                          onClick={() =>
                            rejectJoinRequest(request._id)
                          }
                        >
                          × Reject
                        </button>
                      </div>
                    </div>
                  ))}

                  {joinRequests.length === 0 && (
                    <div className="no-requests">
                      No pending join requests.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

           {showLeaveConfirm && (
              <div className="leave-overlay">
                <div className="leave-popup">
                  <h3>Leave LinkUp?</h3>

                  <p>Are you sure you want to leave LinkUp?</p>

                  <div className="leave-actions">
                    <button
                      className="cancel-leave"
                      onClick={() => setShowLeaveConfirm(false)}
                    >
                      No
                    </button>

                    <button
                      className="confirm-leave"
                      onClick={onLogout}
                    >
                      Yes, Leave
                    </button>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
}


function GuessNumberGame({ onBack }) {
  const [secret, setSecret] = useState(
    () => Math.floor(Math.random() * 100) + 1
  );
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("Pick a number between 1 and 100!");
  const [attempts, setAttempts] = useState(0);
  const [won, setWon] = useState(false);

  function checkGuess() {
    const number = Number(guess);

    if (!guess.trim() || !Number.isInteger(number) || number < 1 || number > 100) {
      setMessage("Enter a whole number from 1 to 100.");
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (number === secret) {
      setMessage(`Correct! You got it in ${nextAttempts} attempts! 🎉`);
      setWon(true);
    } else if (number < secret) {
      setMessage("Too low! Try a higher number ⬆️");
    } else {
      setMessage("Too high! Try a lower number ⬇️");
    }

    setGuess("");
  }

  function restart() {
    setSecret(Math.floor(Math.random() * 100) + 1);
    setGuess("");
    setAttempts(0);
    setMessage("Pick a number between 1 and 100!");
    setWon(false);
  }

  return (
    <div className="game-panel">
      <button className="game-back" onClick={onBack}>← All Games</button>
      <h3>🎯 Guess the Number</h3>
      <p>{message}</p>

      {!won && (
        <div className="game-controls">
          <input
            type="number"
            min="1"
            max="100"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkGuess()}
            placeholder="Enter your guess"
          />
          <button onClick={checkGuess}>Guess</button>
        </div>
      )}

      <p>Attempts: {attempts}</p>
      {won && <button onClick={restart}>Play Again</button>}
    </div>
  );
}

function TicTacToeGame({ onBack }) {
  const [board, setBoard] = useState(Array(9).fill(""));
  const [status, setStatus] = useState("Your turn! You are X.");
  const [finished, setFinished] = useState(false);

  function getWinner(squares) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of lines) {
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }

    return "";
  }

  function handleMove(index) {
    if (board[index] || finished) return;

    const next = [...board];
    next[index] = "X";

    if (getWinner(next) === "X") {
      setBoard(next);
      setStatus("You win! 🎉");
      setFinished(true);
      return;
    }

    if (next.every(Boolean)) {
      setBoard(next);
      setStatus("It's a draw! 🤝");
      setFinished(true);
      return;
    }

    const empty = next
      .map((value, i) => value === "" ? i : -1)
      .filter((i) => i !== -1);

    const computerMove = empty[Math.floor(Math.random() * empty.length)];
    next[computerMove] = "O";

    if (getWinner(next) === "O") {
      setStatus("Computer wins! Try again.");
      setFinished(true);
    } else if (next.every(Boolean)) {
      setStatus("It's a draw! 🤝");
      setFinished(true);
    } else {
      setStatus("Your turn! You are X.");
    }

    setBoard(next);
  }

  function restart() {
    setBoard(Array(9).fill(""));
    setStatus("Your turn! You are X.");
    setFinished(false);
  }

  return (
    <div className="game-panel">
      <button className="game-back" onClick={onBack}>← All Games</button>
      <h3>❌⭕ Tic-Tac-Toe</h3>
      <p>{status}</p>

      <div className="tic-tac-toe-board">
        {board.map((value, index) => (
          <button
            key={index}
            className="tic-tac-toe-cell"
            onClick={() => handleMove(index)}
            disabled={Boolean(value) || finished}
          >
            {value}
          </button>
        ))}
      </div>

      <button onClick={restart}>Restart Game</button>
    </div>
  );
}


export default App;