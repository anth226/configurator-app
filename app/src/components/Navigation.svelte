<script lang="ts">
  import { Action } from '../interfaces/action'
  import Configuration from './Configuration.svelte'
  import ProductInfo from './ProductInfo.svelte'
  import Cart from './Cart.svelte'
  import Save from './Save.svelte'
  import Toast from './Toast.svelte'
  import { action, toast } from '../store'

  export let visible = false
  export let disabled = false

  const handleAction = (a: Action) => ($action = a)
</script>

<nav class:visible class:disabled>
  {#if $action === Action.INFO}
    <ProductInfo {handleAction} />
  <!-- {:else if $action === Action.CART}
    <Cart /> -->
  {:else if $action === Action.CONFIGURATE}
    <Configuration {handleAction} />
  {:else if $action === Action.SAVE}
    <Save />
  {/if}
  {#if $toast.show}
    <Toast />
  {/if}
</nav>

{#if $action === Action.INFO}
  <div class="scroll-fade"></div>
{/if}

<style>
  nav {
    width: 433px;
    background: var(--color-white);
    display: flex;
    flex-flow: column;
    /* height: 100vh; */
    overflow-y: auto;
    overflow-x: hidden;
    /* transform: translateX(100%); */
    padding: 16px 0 32px;
    position: relative;
    /* transition: transform 0.2s ease-in-out; */
    /* border-top: 1px solid var(--color-light-gray);
    border-bottom: 1px solid var(--color-light-gray); */
  }

  .visible {
    /* transform: translateX(0%) !important; */
  }

  .disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  @media screen and (max-width: 1024px) {
    nav {
      /* flex-direction: row; */
      width: 100%;
      padding: 0;
      height: 100%;
      padding: 0;
      /* min-height: 100%; */

      /* overflow-y: visible; */
      /* font-size: 14px; */
      /* background-color: red; */
    }
  }

  @media screen and (min-width: 1025px) {
    .scroll-fade {
      width: 433px;
      height: 90px;
      background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.8));
      right: 0;
      bottom: 0;
      display: block;
      content: "";
      position: absolute;
      pointer-events: none;
    }
  }
</style>
