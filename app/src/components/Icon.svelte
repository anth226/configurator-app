<script lang="ts">
  import Chevron from '../assets/chevron.svg'
  export let Icon: SVGElement = undefined
  export let rotate = 0
</script>

<span class="icon">
  {#if Icon}
    <svelte:component
      this={Icon}
      style="transform: rotate({rotate}deg); transition: all .2s;"
    />
  {:else}
    <Chevron style="transform: rotate({rotate}deg); transition: all .2s;" />
  {/if}
</span>

<style>
  .icon {
    /* display: flex; */
  }
</style>
