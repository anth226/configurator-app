<script lang="ts">
  import { _ } from 'svelte-i18n'
  import Button from './Button.svelte'
  import { configuration, selectedDetails, action, shopCurrency, configurationProductType } from '../store'
  import { formatPriceToShopStyle } from '../api/index'
  import { Action } from '../interfaces/action'
  import SayDuck3D from './SayDuck3D.svelte'

  const resetAction = () => ($action = Action.INFO)

  let productViewerImages = [
    'https://i.ibb.co/9h3CPCg/Screenshot-2021-03-10-at-10-03-39.png',
  ]

  let selectedProductImage = productViewerImages[0]
</script>

<div class="product-viewer-container">
  <div
    class="product-viewer-title-container {$action === Action.CONFIGURATE
      ? 'visible'
      : ''}"
  >
    <!-- {#if $action === Action.CONFIGURATE} -->
    <div class="product-info-row">
      <p>{$configuration.name}</p>
      <span class="price-info-top __configurator-mobile">{formatPriceToShopStyle($selectedDetails.totalShopifyPrice)}</span>
    </div>
    <div class="product-info-row">
      <h1>{$selectedDetails.model}</h1>
      <span class="text-gray price-info-bottom __configurator-mobile">+ {formatPriceToShopStyle($selectedDetails.totalIkeaPrice)} <span class="ikea-price-label">IKEA</span> </span>
    </div>
    <!-- {/if} -->
  </div>
  <!-- <div class="product-viewer-model">
      <div class="product-viewer-toggle-container __configurator-desktop">
        {#each productViewerImages as image}
        <div class="product-viewer-toggle-item {image === selectedProductImage && 'product-viewer-toggle-item-selected'}" on:click={() => selectedProductImage = image}>
          <img src={image} />
        </div>
        {/each}
      </div> -->
  <!-- <div class="product-viewer-selected-item"> -->
  <!-- <img src={selectedProductImage} /> -->
  <SayDuck3D />
  <!-- </div> -->
  <!-- </div> -->
</div>

<style>
  .product-viewer-container {
    background: #ebebeb;
  }
  .product-viewer-title-container {
    padding: 3em;
    /* min-height: 75px; */
    display: none;
    position: absolute;
    z-index: 10;
  }

  .product-viewer-title-container h1 {
    font-family: 'Quarto-Light';
    font-size: 40px;
    line-height: 33px;
  }

  .product-viewer-title-container h2 {
    font-family: var(--typeBasePrimary), var(--typeBaseFallback);
    font-size: 24px;
    line-height: 24px;
  }

  .product-viewer-model {
    display: flex;
    flex-direction: row;
    align-items: center;
    /* justify-content: space-between; */
    /* position: absolute; */
    /* transform: translate(50%, 50%); */
  }

  .product-viewer-model img {
    display: block;
    margin: auto;
    width: 100%;
    /* height: auto; */
  }

  .product-viewer-toggle-item {
    border: 1px solid var(--color-light-gray);
    margin: 1em;
    cursor: pointer;
  }

  .product-viewer-selected-item {
    display: flex;
    margin: auto;
  }

  .product-viewer-selected-item img {
    /* height: 500px; */
    /* width: 700px; */
    object-fit: contain;
  }

  .product-viewer-toggle-item:hover {
    opacity: 0.5;
  }

  .product-viewer-toggle-item img {
    height: 50px;
    width: 50px;
    /* object-fit: cover; */
    object-fit: contain;
  }

  .product-viewer-toggle-item-selected {
    border-color: var(--color-dark-gray);
  }

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

  .product-viewer-title-container.visible {
    display: block;
  }

  .text-gray {
    color: var(--color-dark-gray);
  }

  .product-info-row {
    display: flex;
    justify-content: space-between;
  }

  .product-info-row p {
    flex: 1;
    margin: 0;
    font-size: 15px;
  }

  .price-info-top {
    display: flex;
    flex-direction: row;
    align-self: flex-end;
    font-size: 15px;
    line-height: 24px;
    font-family: var(--typeBasePrimary), var(--typeBaseFallback);
    font-weight: bold;
    min-width: fit-content;
  }

  .price-info-bottom {
    display: flex;
    align-self: flex-start;
    font-size: 15px;
    line-height: 24px;
    font-family: var(--typeBasePrimary), var(--typeBaseFallback);
    min-width: fit-content;
  }

  @media screen and (max-width: 1024px) {
    .product-viewer-title-container {
      display: block;
      position: relative;
      /* background-color: var(--color-gray); */
      background-color: #ebebeb;
      padding: 16px 16px 0;
    }

    .product-info-row {
      align-items: center;
    }

    .price-info-bottom {
      align-self: center;
    }

    .product-viewer-title-container h1 {
      font-size: 28px;
      line-height: 28px;
    }
  }
</style>
