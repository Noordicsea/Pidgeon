<script>
  export let message = 'Initializing database...';
  export let onRetry = null;
  
  $: isError = message && (message.toLowerCase().includes('failed') || message.toLowerCase().includes('error'));
</script>

<div class="loading-container">
  <div class="loading-content">
    {#if !isError}
      <div class="spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
    {/if}
    <h2 class="loading-title">Setting up your workspace</h2>
    <p class="loading-message">{message}</p>
    {#if isError && onRetry}
      <button class="retry-button" on:click={onRetry}>Retry</button>
    {/if}
  </div>
</div>

<style>
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
  }

  .loading-content {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .spinner {
    position: relative;
    width: 64px;
    height: 64px;
  }

  .spinner-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 3px solid transparent;
    border-top-color: #646cff;
    border-radius: 50%;
    animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  }

  .spinner-ring:nth-child(1) {
    animation-delay: -0.45s;
    border-top-color: #646cff;
    opacity: 1;
  }

  .spinner-ring:nth-child(2) {
    animation-delay: -0.3s;
    border-top-color: #535bf2;
    opacity: 0.8;
    width: 80%;
    height: 80%;
    top: 10%;
    left: 10%;
  }

  .spinner-ring:nth-child(3) {
    animation-delay: -0.15s;
    border-top-color: #747bff;
    opacity: 0.6;
    width: 60%;
    height: 60%;
    top: 20%;
    left: 20%;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .loading-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .loading-message {
    margin: 0;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
    max-width: 400px;
  }

  .retry-button {
    margin-top: 1.5rem;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    color: white;
    background: #646cff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .retry-button:hover {
    background: #535bf2;
  }

  .retry-button:active {
    background: #4348c4;
  }

  @media (prefers-color-scheme: light) {
    .loading-container {
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    }

    .loading-title {
      color: #213547;
    }

    .loading-message {
      color: rgba(0, 0, 0, 0.6);
    }
  }
</style>

