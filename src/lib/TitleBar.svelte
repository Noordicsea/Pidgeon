<script>
  import { onMount, onDestroy } from 'svelte';

  let isMaximized = false;
  let cleanup = null;

  async function handleMinimize() {
    if (window.electron?.windowControls) {
      await window.electron.windowControls.minimize();
    }
  }

  async function handleMaximize() {
    if (window.electron?.windowControls) {
      await window.electron.windowControls.maximize();
    }
  }

  async function handleClose() {
    if (window.electron?.windowControls) {
      await window.electron.windowControls.close();
    }
  }

  onMount(async () => {
    // Check initial maximize state
    if (window.electron?.windowControls) {
      isMaximized = await window.electron.windowControls.isMaximized();
      
      // Listen for maximize state changes
      cleanup = window.electron.windowControls.onMaximizeChange((maximized) => {
        isMaximized = maximized;
      });
    }
  });

  onDestroy(() => {
    if (cleanup) {
      cleanup();
    }
  });
</script>

<div class="title-bar" data-platform="win32">
  <div class="title-bar-drag-region"></div>
  <div class="title-bar-controls">
    <button 
      class="title-bar-button minimize-button" 
      on:click={handleMinimize}
      title="Minimize"
      aria-label="Minimize"
    >
      <svg width="12" height="12" viewBox="0 0 12 12">
        <rect x="0" y="5" width="12" height="1" fill="currentColor"/>
      </svg>
    </button>
    <button 
      class="title-bar-button maximize-button" 
      on:click={handleMaximize}
      title={isMaximized ? "Restore" : "Maximize"}
      aria-label={isMaximized ? "Restore" : "Maximize"}
    >
      {#if isMaximized}
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M3 3h6v6H3V3zm1 1v4h4V4H4z" fill="currentColor"/>
        </svg>
      {:else}
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect x="0" y="0" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1"/>
        </svg>
      {/if}
    </button>
    <button 
      class="title-bar-button close-button" 
      on:click={handleClose}
      title="Close"
      aria-label="Close"
    >
      <svg width="12" height="12" viewBox="0 0 12 12">
        <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</div>

<style>
  .title-bar {
    display: flex;
    align-items: center;
    height: 32px;
    background-color: #1e1f22;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    -webkit-app-region: drag;
    user-select: none;
    position: relative;
    z-index: 1000;
  }

  .title-bar-drag-region {
    flex: 1;
    height: 100%;
    -webkit-app-region: drag;
  }

  .title-bar-controls {
    display: flex;
    height: 100%;
    -webkit-app-region: no-drag;
  }

  .title-bar-button {
    width: 46px;
    height: 100%;
    border: none;
    background: transparent;
    color: #b9bbbe;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.15s ease;
    padding: 0;
    margin: 0;
  }

  .title-bar-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .title-bar-button:active {
    background-color: rgba(255, 255, 255, 0.15);
  }

  .close-button:hover {
    background-color: #e81123;
    color: #ffffff;
  }

  .close-button:active {
    background-color: #c50e1f;
  }

  .title-bar-button svg {
    width: 12px;
    height: 12px;
  }

  /* Ensure buttons are visible */
  .title-bar-button:focus {
    outline: none;
  }
</style>

