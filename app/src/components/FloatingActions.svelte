<script lang="ts">
  import Button from './Button.svelte'

  import { action } from '../store'
  import { Action } from '../interfaces/action'

  const resetAction = () => ($action = Action.INFO)
</script>

<div class="floating-actions">
  <div class="floating-actions-wrapper">
    <div
      class="button-wrapper {$action === Action.CONFIGURATE ? 'active' : ''}"
    >
      <Button class="btn btn--primary btn--full" on:click={resetAction}>Done</Button>
    </div>
  </div>
</div>

<style>
  .floating-actions {
    overflow: hidden;
    display: flex;
    justify-content: center;
    position: absolute;
    bottom: 16px;
    left: 0;
    right: 0;
  }

  .floating-actions-wrapper {
    width: 30%;
    display: flex;
    align-items: stretch;
  }

  .button-wrapper {
    display: flex;
    flex: 1;
    margin: 8px;
    transform: translateY(105%);
    transition: transform 0.2s ease-in-out;
  }
  .active {
    transform: translateY(0%) !important;
  }
</style>
