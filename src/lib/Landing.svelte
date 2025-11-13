<script>
  import { onMount } from 'svelte';
  
  export let user;
  export let onLogout;

  let mounted = false;
  let selectedChannel = null;
  let messageInput = '';
  let channels = [
    { id: 1, name: 'general', type: 'channel', unread: 3 },
    { id: 2, name: 'random', type: 'channel', unread: 0 },
    { id: 3, name: 'announcements', type: 'channel', unread: 1 },
    { id: 4, name: 'development', type: 'channel', unread: 0 },
    { id: 5, name: 'design', type: 'channel', unread: 0 }
  ];

  let messages = {
    1: [
      { id: 1, author: 'Alice', content: 'Hey everyone! Welcome to the general channel.', timestamp: new Date(Date.now() - 3600000) },
      { id: 2, author: 'Bob', content: 'Thanks! Excited to be here.', timestamp: new Date(Date.now() - 3300000) },
      { id: 3, author: 'Charlie', content: 'Same here! Looking forward to collaborating.', timestamp: new Date(Date.now() - 3000000) },
      { id: 4, author: 'Alice', content: 'Feel free to introduce yourselves!', timestamp: new Date(Date.now() - 2700000) }
    ],
    2: [
      { id: 5, author: 'David', content: 'Anyone up for a game?', timestamp: new Date(Date.now() - 7200000) },
      { id: 6, author: 'Eve', content: 'Sure! What game?', timestamp: new Date(Date.now() - 6900000) }
    ],
    3: [
      { id: 7, author: 'Admin', content: 'New feature release coming this week!', timestamp: new Date(Date.now() - 86400000) }
    ],
    4: [],
    5: []
  };

  onMount(() => {
    mounted = true;
    // Select first channel by default
    if (channels.length > 0) {
      selectedChannel = channels[0].id;
    }
  });

  function selectChannel(channelId) {
    selectedChannel = channelId;
    // Mark channel as read
    const channel = channels.find(c => c.id === channelId);
    if (channel) {
      channel.unread = 0;
    }
  }

  function sendMessage() {
    if (!messageInput.trim() || !selectedChannel) return;
    
    const newMessage = {
      id: Date.now(),
      author: user.name.split(' ')[0],
      content: messageInput.trim(),
      timestamp: new Date()
    };
    
    if (!messages[selectedChannel]) {
      messages[selectedChannel] = [];
    }
    messages[selectedChannel] = [...messages[selectedChannel], newMessage];
    messageInput = '';
  }

  function handleKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  function formatMessageTime(date) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function getInitials(name) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function handleLogout() {
    if (onLogout) {
      onLogout();
    }
  }

  function getCurrentChannel() {
    return channels.find(c => c.id === selectedChannel);
  }
</script>

<div class="message-container" class:mounted>
  <!-- Left Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="server-icon">
        <span>{getInitials(user.name)}</span>
      </div>
      <h2 class="server-name">{user.name.split(' ')[0]}'s Workspace</h2>
    </div>
    
    <div class="channels-section">
      <div class="section-header">
        <span class="section-title">CHANNELS</span>
        <button class="add-button" title="Create Channel">+</button>
      </div>
      <nav class="channels-list">
        {#each channels as channel}
          <button
            class="channel-item"
            class:active={selectedChannel === channel.id}
            on:click={() => selectChannel(channel.id)}
          >
            <span class="channel-icon">#</span>
            <span class="channel-name">{channel.name}</span>
            {#if channel.unread > 0}
              <span class="unread-badge">{channel.unread}</span>
            {/if}
          </button>
        {/each}
      </nav>
    </div>

    <div class="user-panel">
      <div class="user-info">
        <div class="user-avatar">
          <span>{getInitials(user.name)}</span>
        </div>
        <div class="user-details">
          <div class="user-name">{user.name.split(' ')[0]}</div>
          <div class="user-status">Online</div>
        </div>
      </div>
      <div class="user-actions">
        <button class="action-icon" title="Mute" on:click={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="currentColor"/>
            <path d="M8 4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1s1-.45 1-1V5c0-.55-.45-1-1-1z" fill="currentColor"/>
          </svg>
        </button>
        <button class="action-icon logout-btn" title="Logout" on:click={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 14H3c-.55 0-1-.45-1-1V3c0-.55.45-1 1-1h3c.55 0 1 .45 1 1s-.45 1-1 1H4v8h2c.55 0 1 .45 1 1s-.45 1-1 1zm5-9l-4 4 4 4c.39.39.39 1.02 0 1.41-.39.39-1.02.39-1.41 0L6.29 9.7c-.39-.39-.39-1.02 0-1.41L9.59 4.88c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  </aside>

  <!-- Main Content Area -->
  <main class="main-content">
    {#if selectedChannel}
      {@const channel = getCurrentChannel()}
      <!-- Channel Header -->
      <header class="channel-header">
        <div class="channel-header-left">
          <span class="channel-header-icon">#</span>
          <h1 class="channel-title">{channel.name}</h1>
        </div>
        <div class="channel-header-right">
          <button class="header-button" title="Threads">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2C5.58 2 2 5.58 2 10c0 1.54.41 2.98 1.12 4.22L1 19l4.78-2.12C7.02 17.59 8.46 18 10 18c4.42 0 8-3.58 8-8s-3.58-8-8-8z" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
          </button>
          <button class="header-button" title="Notification Settings">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2C6.48 2 3.5 4.98 3.5 8.5c0 2.5-1 4.5-1 4.5h15s-1-2-1-4.5C16.5 4.98 13.52 2 10 2z" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <path d="M7.5 16.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
          </button>
          <button class="header-button" title="Pinned Messages">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6z" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
          </button>
          <div class="header-divider"></div>
          <button class="header-button" title="Members">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 10c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM10 12c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
          </button>
          <input type="text" class="search-input" placeholder="Search" />
        </div>
      </header>

      <!-- Messages Area -->
      <div class="messages-area">
        {#if messages[selectedChannel] && messages[selectedChannel].length > 0}
          <div class="messages-list">
            {#each messages[selectedChannel] as message (message.id)}
              <div class="message">
                <div class="message-avatar">
                  <span>{getInitials(message.author)}</span>
                </div>
                <div class="message-content">
                  <div class="message-header">
                    <span class="message-author">{message.author}</span>
                    <span class="message-time">{formatMessageTime(message.timestamp)}</span>
                  </div>
                  <div class="message-text">{message.content}</div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="empty-state">
            <div class="empty-icon">💬</div>
            <h3>No messages yet</h3>
            <p>Be the first to send a message in #{channel.name}!</p>
          </div>
        {/if}
      </div>

      <!-- Message Input -->
      <div class="message-input-container">
        <div class="input-wrapper">
          <button class="input-button" title="Add Attachment">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 7h-4V3c0-1.1-.9-2-2-2s-2 .9-2 2v4H3c-1.1 0-2 .9-2 2s.9 2 2 2h4v4c0 1.1.9 2 2 2s2-.9 2-2v-4h4c1.1 0 2-.9 2-2s-.9-2-2-2z" fill="currentColor"/>
            </svg>
          </button>
          <textarea
            class="message-input"
            placeholder={`Message #${channel.name}`}
            bind:value={messageInput}
            on:keydown={handleKeydown}
            rows="1"
          ></textarea>
          <button class="input-button emoji-button" title="Add Emoji">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <circle cx="7" cy="8" r="1" fill="currentColor"/>
              <circle cx="13" cy="8" r="1" fill="currentColor"/>
              <path d="M7 12c1.5 1 3.5 1 5 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    {:else}
      <div class="no-channel-selected">
        <div class="empty-icon">👋</div>
        <h2>Welcome to {user.name.split(' ')[0]}'s Workspace</h2>
        <p>Select a channel to start messaging</p>
      </div>
    {/if}
  </main>
</div>

<style>
  .message-container {
    display: flex;
    height: 100%;
    width: 100%;
    background-color: #313338;
    color: #f2f3f5;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    overflow: hidden;
  }

  .message-container.mounted {
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Sidebar */
  .sidebar {
    width: 240px;
    background-color: #1e1f22;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgba(255, 255, 255, 0.06);
  }

  .sidebar-header {
    padding: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .server-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
    color: white;
    flex-shrink: 0;
  }

  .server-name {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #f2f3f5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .channels-section {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    margin-bottom: 4px;
  }

  .section-title {
    font-size: 11px;
    font-weight: 600;
    color: #949ba4;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .add-button {
    width: 20px;
    height: 20px;
    border: none;
    background: transparent;
    color: #949ba4;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.15s;
  }

  .add-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #f2f3f5;
  }

  .channels-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 8px;
  }

  .channel-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border: none;
    background: transparent;
    color: #949ba4;
    cursor: pointer;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
    text-align: left;
    width: 100%;
    transition: all 0.15s;
    position: relative;
  }

  .channel-item:hover {
    background-color: rgba(255, 255, 255, 0.06);
    color: #f2f3f5;
  }

  .channel-item.active {
    background-color: rgba(255, 255, 255, 0.1);
    color: #f2f3f5;
  }

  .channel-icon {
    font-size: 20px;
    font-weight: 300;
  }

  .channel-name {
    flex: 1;
  }

  .unread-badge {
    background-color: #f23f42;
    color: white;
    font-size: 12px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
  }

  .user-panel {
    padding: 8px;
    background-color: #232428;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    color: white;
    flex-shrink: 0;
  }

  .user-details {
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-size: 14px;
    font-weight: 600;
    color: #f2f3f5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-status {
    font-size: 12px;
    color: #b9bbbe;
  }

  .user-actions {
    display: flex;
    gap: 4px;
  }

  .action-icon {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: #b9bbbe;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.15s;
    padding: 0;
  }

  .action-icon:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #f2f3f5;
  }

  .logout-btn:hover {
    background-color: rgba(237, 66, 69, 0.2);
    color: #ed4245;
  }

  /* Main Content */
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #313338;
    overflow: hidden;
  }

  .channel-header {
    height: 48px;
    padding: 0 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #2b2d31;
  }

  .channel-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .channel-header-icon {
    font-size: 24px;
    color: #949ba4;
    font-weight: 300;
  }

  .channel-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #f2f3f5;
  }

  .channel-header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-button {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: #b9bbbe;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.15s;
    padding: 0;
  }

  .header-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #f2f3f5;
  }

  .header-divider {
    width: 1px;
    height: 24px;
    background-color: rgba(255, 255, 255, 0.06);
    margin: 0 4px;
  }

  .search-input {
    width: 144px;
    height: 24px;
    padding: 0 8px;
    background-color: #1e1f22;
    border: none;
    border-radius: 4px;
    color: #f2f3f5;
    font-size: 14px;
    transition: all 0.15s;
  }

  .search-input::placeholder {
    color: #949ba4;
  }

  .search-input:focus {
    outline: none;
    width: 240px;
    background-color: #1e1f22;
  }

  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
  }

  .messages-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .message {
    display: flex;
    gap: 16px;
    padding: 4px 0;
  }

  .message-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 16px;
    color: white;
    flex-shrink: 0;
  }

  .message-content {
    flex: 1;
    min-width: 0;
  }

  .message-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 4px;
  }

  .message-author {
    font-weight: 600;
    font-size: 16px;
    color: #f2f3f5;
  }

  .message-time {
    font-size: 12px;
    color: #949ba4;
  }

  .message-text {
    font-size: 16px;
    color: #dcddde;
    line-height: 1.375;
    word-wrap: break-word;
  }

  .empty-state,
  .no-channel-selected {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #949ba4;
    text-align: center;
    padding: 40px;
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .empty-state h3,
  .no-channel-selected h2 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
    color: #f2f3f5;
  }

  .empty-state p,
  .no-channel-selected p {
    margin: 0;
    font-size: 16px;
    color: #949ba4;
  }

  .message-input-container {
    padding: 16px;
    background-color: #2b2d31;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background-color: #383a40;
    border-radius: 8px;
    padding: 8px;
  }

  .input-button {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: #b9bbbe;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.15s;
    padding: 0;
    flex-shrink: 0;
  }

  .input-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #f2f3f5;
  }

  .message-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #f2f3f5;
    font-size: 16px;
    font-family: inherit;
    resize: none;
    max-height: 200px;
    padding: 0;
    line-height: 1.375;
  }

  .message-input::placeholder {
    color: #949ba4;
  }

  .message-input:focus {
    outline: none;
  }

  /* Scrollbar styling */
  .channels-section::-webkit-scrollbar,
  .messages-area::-webkit-scrollbar {
    width: 8px;
  }

  .channels-section::-webkit-scrollbar-track,
  .messages-area::-webkit-scrollbar-track {
    background: transparent;
  }

  .channels-section::-webkit-scrollbar-thumb,
  .messages-area::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .channels-section::-webkit-scrollbar-thumb:hover,
  .messages-area::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar {
      width: 200px;
    }

    .server-name {
      display: none;
    }

    .sidebar-header {
      justify-content: center;
    }
  }
</style>
