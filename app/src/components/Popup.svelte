<script lang="ts">
  import { _ } from 'svelte-i18n'
  import Button from './Button.svelte'
  import { togglePopup } from '../store'
</script>

<div class="configurator-popup-container">
  <div class="configurator-popup-content">
    <p class="text-italic">{$togglePopup.content}</p>
    <Button class="btn btn--primary btn--full" on:click={() => ($togglePopup = {show: false, content: ''})}
      >{$_('CLOSE')}</Button
    >
  </div>
</div>

<style>
  .configurator-popup-container {
    position: absolute;
    display: flex;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.66);
    z-index: 10;
    width: 100%;
    height: 100%;
  }

  .configurator-popup-content {
    position: relative;
    display: flex;
    flex-direction: column;
    margin: auto;
    background-color: var(--color-white);
    width: 355px;
    align-items: center;
    padding: 16px 32px;
  }
</style>
