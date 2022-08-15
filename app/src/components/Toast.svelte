<script>
  import { flip } from 'svelte/animate'
  import { fly } from 'svelte/transition'
  import { toast } from '../store'
</script>

<div class="configurator-toast-container">
  <div class="configurator-toast" on:click={() => ($toast.show = false)} transition:fly={{ y: 30 }}>
    <span class="configurator-toast-content">{$toast.content}</span>
    {#if $toast.specialCaseContent.length}
    <span class="configurator-toast-content">{$toast.specialCaseContent}</span>
    {/if}
  </div>
</div>

<style>
  .configurator-toast-container {
    position: fixed;
    bottom: 20%;
    /* left: 0; */
    /* right: 0; */
    /* margin: 0 auto; */
    padding: 0;
    z-index: 9999;
    display: flex;
    width: inherit;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }

  .configurator-toast {
    flex: 0 0 auto;
    background-color: rgba(0, 0, 0, 0.7);
    text-align: center;
  }

  .configurator-toast-content {
    padding: 10px;
    display: block;
    color: var(--color-white);
    font-weight: 500;
    cursor: pointer;
    max-width: 250px;
  }

  @media screen and (max-width: 1024px) {
    .configurator-toast-container {
      top: 40%;
      bottom: auto;
    }
  }
</style>
