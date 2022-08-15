<script lang="ts">
  import Icon from './Icon.svelte'
  export let title = ''
  let active = false
</script>

<button
  class="accordion"
  on:click={() => {
    active = !active
  }}
>
  <span>{title}</span>
  <Icon rotate={active ? -90 : 90} />
</button>
<div class="container" class:active>
  <div class="content {active ? 'active-content' : ''}">
    <slot />
  </div>
</div>

<style>
  .accordion {
    background: var(--color-white);
    border: none;
    border-bottom: solid 1px;
    border-bottom-color: var(--color-light-gray);
    text-align: left;
    padding: 15px 0;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease-out;
    width: 100%;
  }

  .accordion span {
    flex: 1;
    font-family: var(--typeBasePrimary), var(--typeBaseFallback);
    line-height: 24px;
  }

  .container {
    background-color: white;
    max-height: 0;
    overflow: hidden;
  }

  .content {
    /* padding: 0 8px; */
    transform: translateY(-50px);
    transition: all 0.2s ease-out;
    opacity: 0;
  }

  .active-content {
    transform: translateY(0px);
    opacity: 1;
    transition: all 0.2s ease-out;
  }

  .active {
    max-height: max-content;
  }
</style>
