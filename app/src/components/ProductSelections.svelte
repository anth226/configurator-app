<script lang="ts">
  import { _ } from 'svelte-i18n'
  import type { SelectedOptions } from '../interfaces/selected-options'
  import { selectedOptions, configuration, selectedDetails, configurationProductType, lang } from '../store/index'

  const API_URL = globalThis.API_URL

  const colorSampleLinkMap = {
    en: "https://a-s-helsingo.myshopify.com/products/colour-sample-box",
    fi: "https://a-s-helsingo-fi.myshopify.com/products/colour-sample-box",
    sv: "https://a-s-helsingo-se.myshopify.com/products/colour-sample-box"
  }

  // const selections = [
  //   {label: 'Feather Grey', color: '#cccccc'},
  //   {label: 'Calcatta glodlight I Quatrz', color: '#ECECEC'},
  //   {label: 'Candy Handle', color: '#E0E0E0'},
  //   {label: 'Candle Low Legs', color: '#C9AC85'}
  // ];

  // const sortedSelectedOptions: SelectedOptions = {}
  // $: if ($configuration && Object.values($selectedOptions)) {
  //   $configuration.sectionOrder.forEach((s) => {
  //     if ($selectedOptions[s]) sortedSelectedOptions[s] = $selectedOptions[s]
  //   })
  // }
</script>

<div>
<ul>
  <!-- {#each selections as selection}
  <li><span style="background: {selection.color}" />{selection.label}</li>
  {/each} -->
  <!-- {#if sortedSelectedOptions}
    {#each Object.values(sortedSelectedOptions) as selectedOption}
      <li>
        <img
          src={`${API_URL}images/${selectedOption.photo}`}
          alt={selectedOption.name}
        />
        <span>{selectedOption.name}</span>
      </li>
    {/each} -->
  {#if $selectedDetails}
      <li>
          {#if $configurationProductType === 'sideboard'}
            <img  src="https://cdn.shopify.com/s/files/1/0529/0488/6424/files/sideboard_icon_dimensions.png" alt="dimensions"/>
          {:else}
            <img  src="https://cdn.shopify.com/s/files/1/0529/0488/6424/files/wardrobe_icon_dimensions.png" alt="dimensions"/>
          {/if}
        <span>{`${$selectedDetails.width} x ${$selectedDetails.height} x ${$selectedDetails.depth}`}</span>
      </li>
      <li>
        <img
          
          src={`${API_URL}images/${$selectedDetails.colorImage}`}
          alt={$selectedDetails.color}
        />
        <span>{$_(`${$selectedDetails.color.toUpperCase().replaceAll(' ','')}`, {default: $selectedDetails.color})}</span>
      </li>
      {#if $configurationProductType === 'sideboard'}
      <li>
        <img
          
          src={`${API_URL}images/${$selectedDetails.worktopsImage}`}
          alt={$selectedDetails.worktops}
        />
        <span>{$_(`${$selectedDetails.worktops.toUpperCase().replaceAll(' ','')}`, {default: $selectedDetails.worktops})}</span>
      </li>
      {/if}
      <li>
        <img
          
          src={`${API_URL}images/${$selectedDetails.handlesImage}`}
          alt={$selectedDetails.handles}
        />
        <span>{$_(`${$selectedDetails.handles.toUpperCase().replaceAll(' ','')}`, {default: $selectedDetails.handles})}</span>
      </li>
      {#if $configurationProductType === 'sideboard'}
      <li>
        <img
          
          src={`${API_URL}images/${$selectedDetails.legsImage}`}
          alt={$selectedDetails.legs}
        />
        <span>{$_(`${$selectedDetails.legs.toUpperCase().replaceAll(' ','')}`, {default: $selectedDetails.legs})}</span>
      </li>
      {/if}
  {:else if !$selectedDetails}
    <p>No customization options chosen yet. Please configure!</p>
  {/if}
</ul>
<div class="my-2">
  <a target="_blank" href={colorSampleLinkMap[$lang]}>{$_('ORDER_COLOR_SAMPLE')}</a>
</div>
</div>

<style>
  ul {
    margin: 32px 0;
    padding: 0;
    width: 100%;
  }

  ul li {
    display: flex;
    align-items: center;
    font-size: 0.6em;
    margin: 16px 0;
    font-family: var(--typeBasePrimary), var(--typeBaseFallback);
  }

  ul li img {
    max-width: 32px;
    height: 32px;
    object-fit: contain;
    /* border-radius: 50%; */
    margin-right: 16px;
  }
</style>
