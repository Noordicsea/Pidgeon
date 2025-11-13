<script>
  export let onRegisterClick;
  export let onLogin;
</script>

<div class="auth-container">
  <div class="auth-card">
    <h1>Welcome Back</h1>
    <p class="subtitle">Sign in to your account</p>
    
    <form on:submit|preventDefault={onLogin} class="auth-form">
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
        <input 
          type="password" 
          id="password" 
          name="password" 
          placeholder="Enter your password"
          required
        />
      </div>
      
      <button type="submit" class="btn-primary">Sign In</button>
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
  
  input {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.2s;
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
    
    .auth-footer p {
      color: rgba(0, 0, 0, 0.6);
    }
  }
</style>

