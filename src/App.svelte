<script>
  import { onMount } from 'svelte'
  import Login from './lib/Login.svelte'
  import Register from './lib/Register.svelte'
  import Landing from './lib/Landing.svelte'
  import TitleBar from './lib/TitleBar.svelte'
  import DatabaseLoading from './lib/DatabaseLoading.svelte'

  let currentView = 'login'
  let currentUser = null
  let sessionId = null
  let loading = true
  let dbReady = false
  let dbLoadingMessage = 'Initializing database...'

  async function initializeDatabase() {
    try {
      dbLoadingMessage = 'Connecting to database...'
      loading = true
      dbReady = false
      const result = await window.electron.database.isReady()
      if (!result || (typeof result === 'object' && !result.success)) {
        const errorMsg = (typeof result === 'object' && result.error) ? result.error : 'Database initialization failed. Please try again.'
        dbLoadingMessage = errorMsg
        loading = false
        return
      }
      dbReady = true
      loading = false
    } catch (err) {
      console.error('Error initializing database:', err)
      dbLoadingMessage = `Database initialization error: ${err.message || 'Unknown error'}. Please try again.`
      loading = false
      return
    }
  }

  onMount(async () => {
    // First, ensure database is ready
    await initializeDatabase()
    
    if (!dbReady) {
      return
    }

    // Check for existing session
    dbLoadingMessage = 'Checking session...'
    const storedSessionId = localStorage.getItem('sessionId')
    if (storedSessionId) {
      try {
        const result = await window.electron.auth.getSession(storedSessionId)
        if (result.success) {
          sessionId = storedSessionId
          currentUser = result.user
          currentView = 'landing'
        } else {
          // Invalid session, clear it
          localStorage.removeItem('sessionId')
        }
      } catch (err) {
        console.error('Error checking session:', err)
        localStorage.removeItem('sessionId')
      }
    }
    loading = false
  })

  function handleLoginSuccess({ sessionId: newSessionId, user }) {
    sessionId = newSessionId
    currentUser = user
    currentView = 'landing'
  }

  function handleRegisterSuccess(result) {
    if (result && result.sessionId && result.user) {
      // Auto-login successful
      sessionId = result.sessionId
      currentUser = result.user
      currentView = 'landing'
    } else {
      // Registration succeeded but auto-login failed - show login page
      currentView = 'login'
    }
  }

  async function handleLogout() {
    if (sessionId) {
      try {
        await window.electron.auth.logout(sessionId)
      } catch (err) {
        console.error('Error during logout:', err)
      }
    }
    sessionId = null
    currentUser = null
    localStorage.removeItem('sessionId')
    currentView = 'login'
  }

  function showRegister() {
    currentView = 'register'
  }

  function showLogin() {
    currentView = 'login'
  }
</script>

<TitleBar />
<main>
  {#if !dbReady || loading}
    <DatabaseLoading message={dbLoadingMessage} onRetry={initializeDatabase} />
  {:else if currentView === 'landing' && currentUser}
    <Landing user={currentUser} onLogout={handleLogout} />
  {:else if currentView === 'login'}
    <Login 
      onRegisterClick={showRegister} 
      onLoginSuccess={handleLoginSuccess} 
    />
  {:else if currentView === 'register'}
    <Register 
      onBackClick={showLogin} 
      onRegisterSuccess={handleRegisterSuccess} 
    />
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  :global(#app) {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  main {
    flex: 1;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
</style>
