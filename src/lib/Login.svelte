<script>
  export let onRegisterClick;
  export let onLogin;
  export let onLoginSuccess;

  let error = '';
  let loading = false;
  let password = '';
  let showPassword = false;

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  async function handleLogin(event) {
    error = '';
    loading = true;

    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');

    // Validation
    if (!email || !password) {
      error = 'Email and password are required';
      loading = false;
      return;
    }

    try {
      const result = await window.electron.auth.login({
        email,
        password
      });

      if (result.success) {
        // Store session ID in localStorage
        localStorage.setItem('sessionId', result.sessionId);
        
        if (onLoginSuccess) {
          onLoginSuccess({
            sessionId: result.sessionId,
            user: result.user
          });
        }
      } else {
        error = result.error || 'Login failed';
      }
    } catch (err) {
      error = 'An error occurred during login';
      console.error('Login error:', err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="auth-container">
  <div class="auth-card">
    <h1>Welcome Back</h1>
    <p class="subtitle">Sign in to your account</p>
    
    <form on:submit|preventDefault={handleLogin} class="auth-form">
      {#if error}
        <div class="error-message">{error}</div>
      {/if}
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          placeholder="Enter your email"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <div class="input-wrapper">
          <input 
            type={showPassword ? 'text' : 'password'} 
            id="password" 
            name="password" 
            placeholder="Enter your password"
            required
            bind:value={password}
          />
          <button 
            type="button" 
            class="password-toggle" 
            on:click={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {#if showPassword}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            {/if}
          </button>
        </div>
      </div>
      
      <button type="submit" class="btn-primary" disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
    
    <div class="auth-footer">
      <p>Don't have an account? <button class="btn-link" on:click={onRegisterClick}>Register</button></p>
    </div>
  </div>
</div>

<style>
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: 1rem;
    box-sizing: border-box;
  }
  
  .auth-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2rem;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-sizing: border-box;
  }
  
  h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 600;
    text-align: center;
  }
  
  .subtitle {
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 2rem 0;
    font-size: 0.95rem;
  }
  
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    font-size: 0.9rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  input {
    padding: 0.75rem 1rem;
    padding-right: 2.5rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.2s;
    width: 100%;
    box-sizing: border-box;
  }

  .password-toggle {
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }

  .password-toggle:hover {
    color: rgba(255, 255, 255, 0.9);
  }

  .password-toggle:focus {
    outline: none;
  }
  
  input:focus {
    outline: none;
    border-color: #646cff;
    background: rgba(255, 255, 255, 0.08);
  }
  
  input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  .btn-primary {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: none;
    background: #646cff;
    color: white;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 0.5rem;
  }
  
  .btn-primary:hover {
    background: #535bf2;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(100, 108, 255, 0.4);
  }
  
  .btn-primary:active {
    transform: translateY(0);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .error-message {
    padding: 0.75rem 1rem;
    background: rgba(255, 0, 0, 0.1);
    border: 1px solid rgba(255, 0, 0, 0.3);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
    text-align: center;
  }
  
  .auth-footer {
    margin-top: 2rem;
    text-align: center;
  }
  
  .auth-footer p {
    margin: 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
  }
  
  .btn-link {
    background: none;
    border: none;
    color: #646cff;
    cursor: pointer;
    font-size: inherit;
    font-weight: 500;
    padding: 0;
    text-decoration: underline;
    transition: color 0.2s;
  }
  
  .btn-link:hover {
    color: #535bf2;
  }
  
  @media (prefers-color-scheme: light) {
    .auth-card {
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    h1 {
      color: #213547;
    }
    
    .subtitle {
      color: rgba(0, 0, 0, 0.6);
    }
    
    label {
      color: rgba(0, 0, 0, 0.9);
    }
    
    input {
      border: 1px solid rgba(0, 0, 0, 0.2);
      background: rgba(255, 255, 255, 0.8);
      color: rgba(0, 0, 0, 0.9);
    }
    
    input:focus {
      background: rgba(255, 255, 255, 1);
    }

    .password-toggle {
      color: rgba(0, 0, 0, 0.6);
    }

    .password-toggle:hover {
      color: rgba(0, 0, 0, 0.9);
    }
    
    .auth-footer p {
      color: rgba(0, 0, 0, 0.6);
    }
  }
</style>

