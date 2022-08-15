<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { Action } from '../interfaces/action'
  import type { SelectedOptions } from '../interfaces/selected-options'
  import type { ShopifyProduct } from '../interfaces/shopify-product'
  import {
    configuration,
    meta,
    saved,
    shop,
    lang,
    shopCurrency,
    selectedOptions,
    newSavedConfigurationId,
    filteredProductGroup,
    selectedProductSummary,
    selectedIkeaProductSummary,
    selectedDetails,
    sayDuckPhotoLoading,
    sayDuckModelLoading,
    configurationProductType,
    savedConfigurationPhoto,
  } from '../store'
  import { handleSaveConfiguration, getSavedConfigurationUrl, uploadImage, getSavedConfigurationPhotoFile, formatPriceToShopStyle } from '../api'
  import { getCart, addToCart } from '../api/shopify'
  import Accordion from './Accordion.svelte'
  import Button from './Button.svelte'
  import ProductSelections from './ProductSelections.svelte'
  import SaveDesignModal from './SaveDesignModal.svelte'
import App from '../App.svelte'
  const API_URL = globalThis.API_URL;

  export let handleAction = (action: Action) => {}

  const styleMeasurementstableMap: {[key: string]: {[key: string]: {style: string, width: number, height: number}[]}} = {
    sideboard: {
      plain: [
        {style: "Plain", width: 124, height:	42},
        {style: "Plain", width: 164, height:	42},
        {style: "Plain", width: 204, height:	42},
        {style: "Plain", width: 124, height:	62},
        {style: "Plain", width: 164, height:	62},
        {style: "Plain", width: 204, height:	62},
        {style: "Plain", width: 124, height:	82},
        {style: "Plain", width: 164, height:	82},
        {style: "Plain", width: 204, height:	82},
      ],
      spacerPanels: [
        {style: "Spacer panels", width: 128, height:	44},
        {style: "Spacer panels", width: 170, height:	44},
        {style: "Spacer panels", width: 212, height:	44},
        {style: "Spacer panels", width: 128, height:	64},
        {style: "Spacer panels", width: 170, height:	64},
        {style: "Spacer panels", width: 212, height:	64},
        {style: "Spacer panels", width: 128, height:	84},
        {style: "Spacer panels", width: 170, height:	84},
        {style: "Spacer panels", width: 212, height:	84},
      ],
      frame: [
        {style: "Frame", width: 124, height:	44},
        {style: "Frame", width: 164, height:	44},
        {style: "Frame", width: 204, height:	44},
        {style: "Frame", width: 124, height:	64},
        {style: "Frame", width: 164, height:	64},
        {style: "Frame", width: 204, height:	64},
        {style: "Frame", width: 124, height:	84},
        {style: "Frame", width: 164, height:	84},
        {style: "Frame", width: 204, height:	84},
      ]
    },
    wardrobe: {
      plain: [
        {style: "Plain", width:	104, height: 201},
        {style: "Plain", width:	154, height: 201},
        {style: "Plain", width:	204, height: 201},
        {style: "Plain", width:	254, height: 201},
        {style: "Plain", width:	304, height: 201},
        {style: "Plain", width:	104, height: 236},
        {style: "Plain", width:	154, height: 236},
        {style: "Plain", width:	204, height: 236},
        {style: "Plain", width:	254, height: 236},
        {style: "Plain", width:	304, height: 236},
      ],
      spacerPanels: [
        {style: "Spacer panels", width: 106, height: 203},
        {style: "Spacer panels", width: 158, height: 203},
        {style: "Spacer panels", width: 210, height: 203},
        {style: "Spacer panels", width: 262, height: 203},
        {style: "Spacer panels", width: 314, height: 203},
        {style: "Spacer panels", width: 106, height: 238},
        {style: "Spacer panels", width: 158, height: 238},
        {style: "Spacer panels", width: 210, height: 238},
        {style: "Spacer panels", width: 262, height: 238},
        {style: "Spacer panels", width: 314, height: 238},
      ]
    }
  }
 
  const handleSayduckImage = async () => {
    $sayDuckPhotoLoading = true
    window.dispatchEvent(
      new CustomEvent('sayduck.viewer.actions.takePhoto', {
        detail: { format: 'png', keepPosition: true, noCrop: true },
      })
    )
    await uploadImage(
      $newSavedConfigurationId,
      await getSavedConfigurationPhotoFile($newSavedConfigurationId, $savedConfigurationPhoto)
    )
  }

  let cartProcessing = false;
  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (cartProcessing) return;

    cartProcessing = true;

    const { currency } = await getCart()
    
    $newSavedConfigurationId = await handleSaveConfiguration($meta, $shop, $selectedOptions)
    const savedConfigurationUrl = getSavedConfigurationUrl($newSavedConfigurationId)
    // await handleSayduckImage()
    // handleAction(Action.CART)

    const configurationPartsForCart = Object.values($selectedProductSummary).reduce((acc, p: any) => {
        if(p.productId) {
          const productId = p.productId.split('gid://shopify/ProductVariant/')[1]
          const productLine = { 
            id: productId, 
            quantity: p.count, 
            properties: { '_parent-saved-configuration-id': $newSavedConfigurationId }
          }
          return [...acc, productLine]
        }
        return [...acc]
    }, [])

    const flattenedIkeaProductSummary = Object.values($selectedIkeaProductSummary).reduce((acc, i) => {
      return [...acc, ...i]
    })
    const ikeaPartsForCart = flattenedIkeaProductSummary.reduce((acc, i, currentIndex) => {  
      const line = {[`_ikea-product-${currentIndex + 1}`]: `${i.sku}|${i['name_'+$lang]}|${i.count}|${i['price_'+$shopCurrency.currency.toLowerCase()]}`}
      return {...acc, ...line}
    }, {})

    const ikeaPartsCount = Object.keys(ikeaPartsForCart).length

    const bundleProductForCart = {
      id: $configuration.bundleProductId,
      quantity: 1,
      properties: {
        '_configuration-id': $configuration.meta,
        '_saved-configuration-id': $newSavedConfigurationId,
        '_configuration-url': savedConfigurationUrl,
        '_configuration_image': `${API_URL}images/${$newSavedConfigurationId}.png?size=original`,
        '_configuration-name': `${$selectedDetails.model.toUpperCase()} ${$configurationProductType.toUpperCase()} | ${$selectedDetails.style.toUpperCase()} | ${$selectedDetails.width} CM X ${$selectedDetails.height} CM | ${$selectedDetails.color}`,
        '_price': parseFloat($selectedDetails.totalShopifyPrice.toString()).toFixed(2),
        '_currency_code': currency,
        '_product-line': `${$configurationProductType}`,
        '_model': `${$selectedDetails.model}`,
        '_door-color': `${$selectedDetails.color}`,
        '_side-panel-color': `${$selectedDetails.color}`,
        '_style': `${$selectedDetails.style}`,
        '_width': `${$selectedDetails.width}`,
        '_height': `${$selectedDetails.height}`,
        '_depth': `${$selectedDetails.depth}`,
        '_handle': `${$selectedDetails.handles}`,
        '_legs': `${$selectedDetails.legs}`,
        '_cabinet-frame': `${$selectedDetails.frame}`,
        "_ikea-products-count": `${ikeaPartsCount}`,
        ...ikeaPartsForCart
      }
    }
    
    const items: ShopifyProduct[] = [
      ...configurationPartsForCart,
      bundleProductForCart
    ]

    const cartResponse = await addToCart(items);
    cartProcessing = false;

    if (cartResponse.status && cartResponse.status !== 200) {
      alert(cartResponse.message + ': ' + cartResponse.description)
      return;
    }

    window.top.location.href = '/cart';
  }

  // const handleSaveConfiguration = async (meta: string, shop: string, selectedOptions: SelectedOptions) => {
  //   const data = await saveConfiguration(meta, shop, selectedOptions)
  //   $newSavedConfigurationId = data.meta
  //   handleAction(Action.SAVE)
  // }

</script>

<div class="product-info">
  <div class="product-info-container">
    <div class="product-info-row">
      <p>{$configuration.name}</p>
      <span class="price-info-top">{formatPriceToShopStyle($selectedDetails.totalShopifyPrice)}</span>
    </div>
    <div class="product-info-row">
      <h1>{$selectedDetails.model}</h1>
      <span class="text-gray price-info-bottom">+ {formatPriceToShopStyle($selectedDetails.totalIkeaPrice)} <span class="ikea-price-label">IKEA</span></span>
    </div>
  </div>
  <div class="__configurator-desktop">
    <ProductSelections />
  </div>
  <div class="action-container">
    <!-- <button on:click={() => getCart()}>GET CART</button> -->
    <Button style="margin-bottom: 10px;" disabled={$sayDuckModelLoading} class="btn {cartProcessing ? 'btn--loading' : ''} btn--primary btn--full" on:click={(e) => handleAddToCart(e)}>{$_('ADD_TO_CART')}</Button>
    <Button style="margin-bottom: 10px;" disabled={$sayDuckModelLoading} class="btn btn--secondary btn--full" on:click={() => handleAction(Action.CONFIGURATE)}>{$_('CONFIGURATE')}</Button>
    <SaveDesignModal />
  </div>
  <div class="__configurator-mobile">
    <ProductSelections />
  </div>
  <Accordion title="{$_('MEASUREMENTS_ACCORDION_HEADER')}">
    <div class="accordion-content">
      <!--<h1>{$_('MEASUREMENTS_ACCORDION_TITLE_TEXT')}</h1>-->
      <p>{$_(`MEASUREMENTS_ACCORDION_INFO_TEXT_${$configurationProductType.toUpperCase()}`)}</p>
      {#each Object.values(styleMeasurementstableMap[$configurationProductType]) as styleArray}
      <div class="style-table">
        <span class="product-table-column-title">{$_('MEASUREMENTS_ACCORDION_TABLE_STYLE_HEADER')}</span>
        <span class="product-table-column-title">{$_('MEASUREMENTS_ACCORDION_TABLE_WIDTH_HEADER')}</span>
        <span class="product-table-column-title">{$_('MEASUREMENTS_ACCORDION_TABLE_HEIGHT_HEADER')}</span>
        {#each styleArray as styleItem, index}
          <span class={index % 2 === 0 ? "cell-gray" : "cell-white"}>{styleItem.style}</span>
          <span class={index % 2 === 0 ? "cell-gray" : "cell-white"}>{styleItem.width}</span>
          <span class={index % 2 === 0 ? "cell-gray" : "cell-white"}>{styleItem.height}</span>
        {/each}
      </div>
      {/each}
     <!-- <h3>{$_('MEASUREMENTS_PRODUCTS_TITLE')}</h3>-->
    </div>
  </Accordion>
  <Accordion title="{$_('PRODUCTS_ACCORDION_HEADER')}">
    <div class="accordion-content">
      <div class="product-table">
        <span class="product-table-column-title">{$_('MEASUREMENTS_ACCORDION_TABLE_QUANTITY_HEADER')}</span>
        <span class="product-table-column-title">{$_('MEASUREMENTS_ACCORDION_TABLE_PRODUCT_NAME_HEADER')}</span>
        <span class="product-table-column-title">{$_('MEASUREMENTS_ACCORDION_TABLE_PRODUCT_NUMBER_HEADER')}</span>
        {#each $selectedDetails.shopifyProductList as product, index}
          <span class={index % 2 === 0 ? "cell-gray" : "cell-white"}>{product.count}</span>
          <span class={index % 2 === 0 ? "cell-gray" : "cell-white"}>{product.baseProductTitle} {product.title !== 'Default Title' ? product.title : ''}</span>
          <span class={index % 2 === 0 ? "cell-gray" : "cell-white"}>{product.sku}</span>
        {/each}
      </div>
    </div>
  </Accordion>
  <Accordion title="{$_('IKEA_ACCORDION_HEADER')}">
    <div class="accordion-content">
      <!--<h1>{$_('IKEA_ACCORDION_TITLE_TEXT')}</h1>-->
      <p>{$_(`IKEA_ACCORDION_INFO_TEXT_${$configurationProductType.toUpperCase()}`)}</p>
      <p>{$_('IKEA_ACCORDION_SUBTITLE_TEXT')}</p>
      <div class="product-table">
        <span class="product-table-column-title">{$_('IKEA_ACCORDION_TABLE_QUANTITY_HEADER')}</span>
        <span class="product-table-column-title">{$_('IKEA_ACCORDION_TABLE_PRODUCT_NAME_HEADER')}</span>
        <span class="product-table-column-title">{$_('IKEA_ACCORDION_TABLE_PRODUCT_NUMBER_HEADER')}</span>
        {#each $selectedDetails.ikeaProductList as product, index}
        <span class={index % 2 === 0 ? "cell-gray" : "cell-white"}>{product.count}</span>
        <span class={index % 2 === 0 ? "cell-gray" : "cell-white"}>{product.name}</span>
        <span class={index % 2 === 0 ? "cell-gray" : "cell-grwhiteay"}>{product.sku}</span>
        {/each}
      </div>
      <!-- <p>{$_('IKEA_ACCORDION_BOTTOM_TEXT')}</p> -->
    </div>
  </Accordion>
  <!-- <Accordion title="Door handling">
    <p>Lorem ipsum dolor sit amet</p>
    <p>Lorem ipsum dolor sit amet</p>
    <p>Lorem ipsum dolor sit amet</p>
    <p>Lorem ipsum dolor sit amet</p>
    <p>Lorem ipsum dolor sit amet</p>
  </Accordion> -->
</div>

<style>
  .product-info {
    padding: 15px 45px;
    width: 100%;
  }

  h1 {
    font-family: 'Quarto-Medium';
    flex: 1;
    font-weight: 500;
  }
  .product-info-row {
    display: flex;
    align-items: center;
  }

  .product-info-row p {
    flex: 1;
    margin: 0;
    font-size: 15px;
  }

  .action-container {
    margin-top: 24px;
    display: flex;
    flex-flow: column;
  }
  .text-gray {
    color: var(--color-dark-gray);
  }

  .price-info-top {
    align-self: flex-end;
    font-size: 15px;
    line-height: 24px;
    font-family: var(--typeBasePrimary), var(--typeBaseFallback);
    font-weight: bold;
  }

  .price-info-bottom {
    align-self: flex-start;
    font-size: 15px;
    line-height: 24px;
    font-family: var(--typeBasePrimary), var(--typeBaseFallback);
  }

  .accordion-content h1 {
    margin: 25px 0;
  }

  .accordion-content p {
    line-height: 24px;
  }

  .accordion-content {
    margin-top: 15px;
  }

  .style-table {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 1px;
    margin: 15px 0;
  }

  .product-table {
    display: grid;
    grid-template-columns: 0.5fr 1fr 0.5fr;
    grid-column-gap: 1px;
    margin: 15px 0;
  }

  .product-table .cell-gray,
  .style-table .cell-gray {
    background: #f5f5f5;
  }

  .product-table > span,
  .style-table > span {
    padding: 6px 8px;
    display: flex;
    align-items: center;
  }
  
  .product-table-column-title {
    font-weight: 700;
  }

  @media screen and (max-width: 1024px) {
    .product-info-container {
      display: none;
    }

    .product-info {
      /* padding: 90px 45px 45px; */
      padding: 0 24px 48px;
    }
  }
</style>
