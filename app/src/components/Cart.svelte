<script lang="ts">
  import { _ } from 'svelte-i18n'
  import Button from './Button.svelte'
  import { action, selectedDetails, savedConfigurationPhoto, shopCurrency } from '../store'
  import { formatPriceToShopStyle } from '../api/index'
  import { Action } from '../interfaces/action'

  const resetAction = () => ($action = Action.INFO)
</script>

<div class="cart-container">
  <div class="cart-title-container">
    <div class="cart-title-green-dot" />
    <span>{$_('ADDED_TO_BASKET')}</span>
  </div>

  <div class="cart-product-card">
    <img  src={$savedConfigurationPhoto} alt="saved-configuration"/>
    <div class="product-card-details">
      <span class="text-bold">{$selectedDetails.model}</span>
      <span class="text-gray">{$selectedDetails.color}</span>
      <span class="text-gray">{`${$selectedDetails.width}x${$selectedDetails.height}x${$selectedDetails.depth}`}</span>
      <span class="mt-1 text-bold">{formatPriceToShopStyle($selectedDetails.totalShopifyPrice)}</span>
    </div>
  </div>

  <div class="cart-subtotal-container">
    <span>
      <span class="text-bold">{$_('SUBTOTAL')}</span>
      <span>(2 items)</span>
    </span>
    <span class="text-bold">890 €</span>
  </div>

  <div class="actions">
    <Button class="btn btn--primary btn--full" on:click={resetAction}>{$_('VIEW_CART')}</Button>
    <div class="mt-2" />
    <Button class="btn btn--link btn--full" on:click={resetAction}>{$_('CONTINUE_SHOPPING')}</Button>
  </div>
</div>

<style>
  .cart-container {
    margin: 2em;
  }

  .cart-title-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 1em;
  }

  .cart-title-green-dot {
    height: 16px;
    width: 16px;
    background-color: var(--color-green);
    border-radius: 50%;
    margin-right: 10px;
  }

  .cart-product-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 2em;
  }

  .cart-product-card img {
    height: 150px;
    width: 120px;
    object-fit: cover;
  }

  .product-card-details {
    display: flex;
    flex-direction: column;
    margin: 0 1em;
  }

  .cart-subtotal-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 1em;
  }

  .actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
