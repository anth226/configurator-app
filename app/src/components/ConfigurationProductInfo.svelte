<script lang="ts">
  import { _ } from 'svelte-i18n'
  import Button from './Button.svelte'
  import { action, selectedSection, selectedDetails, shopCurrency, configuration, configurationProductType } from '../store'
  import { formatPriceToShopStyle } from '../api/index'
  import { Action } from '../interfaces/action'

  const resetAction = () => {
    $action = Action.INFO
    $selectedSection = null
  }
</script>

<div class="configuration-product-info-container">
  <div class="__configurator-desktop">
    <div class="product-info-row">
      <h2 class="product__type">{$configuration.name}</h2>
      <span>{formatPriceToShopStyle($selectedDetails.totalShopifyPrice)}</span>
    </div>
    <div class="product-info-row-subtitle">
      <h5 class="product__model">{$selectedDetails['model']}</h5>
      <span class="text-gray">+ {formatPriceToShopStyle($selectedDetails.totalIkeaPrice)} <span class="ikea-price-label">IKEA</span></span>
    </div>
  </div>
  <div class="actions">
    <Button class="btn btn--primary btn--full" on:click={resetAction}
      >{$_('CONFIRM_AND_SHOW_OVERVIEW')}</Button
    >
  </div>
</div>

<style>
  .configuration-product-info-container {
    border-top: solid 1px;
    border-top-color: var(--color-light-gray);
    padding: 16px 32px 0;
  }

  .actions {
    display: flex;
    justify-content: center;
  }
  @media only screen and (min-width: 1025px) {
    .__configurator-desktop {
      display: flex !important;
      flex-direction: column;
      gap: 5px;
    }
    .actions {
      margin-top: 16px;
    }
  }

  .product-info {
    padding: 2em;
    width: 100%;
  }
  .product__model {
    text-transform: none;
    /*font-family: var(--typeHeaderPrimary), var(--typeHeaderFallback);*/
    font-family: 'Quarto-Light';
    letter-spacing: 0;
    font-size: 20px;
    line-height: 1;
    flex: 1;
  }
  .product__type {
    font-size: 15px;
    flex: 1;
  }
  .product-info-row,
  .product-info-row-subtitle {
    display: flex;
    align-items: center;
  }
  .product-info-row span {
    align-self: center;
    font-family: var(--typeBasePrimary), var(--typeBaseFallback);
  }

  .product-info-row-subtitle span {
    align-self: center;
    font-family: var(--typeBasePrimary), var(--typeBaseFallback);
  }

  .text-gray {
    color: var(--color-dark-gray);
  }

  @media screen and (max-width: 1024px) {
    .configuration-product-info-container {
      padding: 18px;
      margin: 0;
      border: none;
    }
  }
</style>
