<script>
  export let onBackClick;
  export let onRegister;
  export let onRegisterSuccess;

  let error = '';
  let loading = false;
  let password = '';
  let confirmPassword = '';
  let showPassword = false;
  let showConfirmPassword = false;

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  function toggleConfirmPasswordVisibility() {
    showConfirmPassword = !showConfirmPassword;
  }

  $: passwordWarning = password.length > 0 && password.length < 6 ? 'Password must be at least 6 characters' : '';
  $: passwordMatchWarning = confirmPassword.length > 0 && password !== confirmPassword ? 'Passwords do not match' : '';

  async function handleRegister(event) {
    error = '';
    loading = true;

    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const passwordValue = formData.get('password');
    const confirmPasswordValue = formData.get('confirmPassword');

    // Validation
    if (!name || !email || !passwordValue || !confirmPasswordValue) {
      error = 'All fields are required';
      loading = false;
      return;
    }

    if (passwordValue !== confirmPasswordValue) {
      error = 'Passwords do not match';
      loading = false;
      return;
    }

    if (passwordValue.length < 6) {
      error = 'Password must be at least 6 characters';
      loading = false;
      return;
    }

    try {
      const result = await window.electron.auth.register({
        email,
        password: passwordValue,
        name
      });

      if (result.success) {
        // Auto-login after successful registration
        try {
          const loginResult = await window.electron.auth.login({
            email,
            password: passwordValue
          });

          if (loginResult.success) {
            localStorage.setItem('sessionId', loginResult.sessionId);
            if (onRegisterSuccess) {
              onRegisterSuccess({
                sessionId: loginResult.sessionId,
                user: loginResult.user
              });
            }
          } else {
            // Registration succeeded but login failed - show login page
            if (onRegisterSuccess) {
              onRegisterSuccess(null);
            }
          }
        } catch (loginErr) {
          console.error('Auto-login error:', loginErr);
          // Registration succeeded but login failed - show login page
          if (onRegisterSuccess) {
            onRegisterSuccess(null);
          }
        }
      } else {
        error = result.error || 'Registration failed';
      }
    } catch (err) {
      error = 'An error occurred during registration';
      console.error('Registration error:', err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="auth-container">
  <div class="auth-card">
    <button class="btn-back" on:click={onBackClick} aria-label="Go back">
      ← Back
    </button>
    
    <h1>Create Account</h1>
    <p class="subtitle">Sign up to get started</p>
    
    <form on:submit|preventDefault={handleRegister} class="auth-form">
      {#if error}
        <div class="error-message">{error}</div>
      {/if}
      <div class="form-group">
        <label for="name">Full Name</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          placeholder="Enter your full name"
          required
        />
      </div>
      
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
            placeholder="Create a password"
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
        {#if passwordWarning}
          <div class="password-warning">{passwordWarning}</div>
        {/if}
      </div>
      
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <div class="input-wrapper">
          <input 
            type={showConfirmPassword ? 'text' : 'password'} 
            id="confirmPassword" 
            name="confirmPassword" 
            placeholder="Confirm your password"
            required
            bind:value={confirmPassword}
          />
          <button 
            type="button" 
            class="password-toggle" 
            on:click={toggleConfirmPasswordVisibility}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {#if showConfirmPassword}
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
        {#if passwordMatchWarning}
          <div class="password-warning">{passwordMatchWarning}</div>
        {/if}
      </div>
      
      <button type="submit" class="btn-primary" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
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
    padding: 1.5rem;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    box-sizing: border-box;
  }
  
  .btn-back {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    padding: 0.5rem;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .btn-back:hover {
    color: rgba(255, 255, 255, 0.9);
  }
  
  h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.75rem;
    font-weight: 600;
    text-align: center;
    padding-top: 0.5rem;
  }
  
  .subtitle {
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 1.5rem 0;
    font-size: 0.9rem;
  }
  
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
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

  .password-warning {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.85rem;
    margin-top: 0.25rem;
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
  
  @media (prefers-color-scheme: light) {
    .auth-card {
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .btn-back {
      color: rgba(0, 0, 0, 0.7);
    }
    
    .btn-back:hover {
      color: rgba(0, 0, 0, 0.9);
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

    .password-warning {
      color: #000000;
    }
  }
</style>

