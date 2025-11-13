<script>
  import Login from './lib/Login.svelte'
  import Register from './lib/Register.svelte'
  import TitleBar from './lib/TitleBar.svelte'

  let currentView = 'login'

  function handleLogin() {
    // Placeholder for future login functionality
    console.log('Login attempted')
  }

  function handleRegister() {
    // Placeholder for future registration functionality
    console.log('Registration attempted')
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
  {#if currentView === 'login'}
    <Login onRegisterClick={showRegister} onLogin={handleLogin} />
  {:else if currentView === 'register'}
    <Register onBackClick={showLogin} onRegister={handleRegister} />
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
