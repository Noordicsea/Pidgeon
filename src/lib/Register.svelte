<script>
  export let onBackClick;
  export let onRegister;
</script>

<div class="auth-container">
  <div class="auth-card">
    <button class="btn-back" on:click={onBackClick} aria-label="Go back">
      ← Back
    </button>
    
    <h1>Create Account</h1>
    <p class="subtitle">Sign up to get started</p>
    
    <form on:submit|preventDefault={onRegister} class="auth-form">
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
        <input 
          type="password" 
          id="password" 
          name="password" 
          placeholder="Create a password"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input 
          type="password" 
          id="confirmPassword" 
          name="confirmPassword" 
          placeholder="Confirm your password"
          required
        />
      </div>
      
      <button type="submit" class="btn-primary">Create Account</button>
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
  }
</style>

