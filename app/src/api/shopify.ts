import type { ShopifyProduct } from '../interfaces/shopify-product';

export const getCart = async () => {
  const response = await fetch(`/cart.js`);
  const data = await response.json();
  return data;
};

export const addToCart = async (items: ShopifyProduct[]) => {
  const response = await fetch(`/cart/add.js`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({'items': items}),
  });
  const data = await response.json();

  /**
   * Events below are handled by theme's javascript.
   * cart:build ==> builds the cart drawer (i.e. adds the HTML content and updates cart blip)
   * cart:open  ==> opens the cart drawer.
   * */
  document.dispatchEvent(new CustomEvent('cart:build'));
  //document.dispatchEvent(new CustomEvent('cart:open'));
  return data;
};

export const updateCart = async (item: ShopifyProduct) => {
  const response = await fetch(`/cart/change.js`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  const data = await response.json();
  return data;
};
