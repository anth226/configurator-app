<script lang="ts">
  import Icon from './Icon.svelte'
  export let primary = false
  export let underline = false
  export let nav = false
  export let icon = false
  export let centered = false
  export let disabled = false
</script>

<button {disabled} 
  on:click|preventDefault class={$$props.class} style={$$props.style} type={$$props.type || 'button'}>
  {#if icon}
    <Icon rotate={180} />
  {/if}
  <span class="reset" class:centered><slot /></span>
</button>

<style>
  .nav {
    border: none;
    color: var(--color-black);
    transition: all 0.2s;
    background: var(--color-white);
    cursor: pointer;
    padding: 1px 6px;
    margin: 0;
    display: flex;
    align-items: center;
    font-size: 0.8em;
    flex: 1;
  }
  .nav:hover {
    background-color: var(--color-white);
  }

  .nav span {
    display: flex;
    /* justify-content: center; */
    align-items: center;
    width: 100%;
    color: var(--color-dark-gray);
    padding-left: 10px;
    font-family: var(--typeHerobutton);
    transition: color 0.16s ease-in-out;
  }

  .nav.with-icon span {
    margin-left: -20px;
  }

  .nav:hover span {
    color: var(--color-black);
  }

  .nav .centered {
    justify-content: center;
  }

  button > span {
    font-size: 15px;
  }
  @media screen and (max-width: 1024px) {
    button > span {
      font-size: 15px;
    }
  }
</style>
