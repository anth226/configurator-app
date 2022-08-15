import type { Configuration } from '../interfaces/configuration';
import type { SelectedOptions } from '../interfaces/selected-options';

export const getConfiguration = async (
  id: string,
  shop: string,
  savedId?: string
): Promise<Configuration> => {
  const API_URL = globalThis.API_URL;
  // const url = `${API_URL}app/configuration/${id}`;
  const url = `${API_URL}configuration/${id}?shop=${shop}&saved=${savedId}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;

  // await new Promise((resolve) => setTimeout(resolve, 2000));
  // return {
  //   id: 'c1',
  //   meta: 'meta1',
  //   name: 'my-configuration-1',
  //   products: [],
  //   sections: [
  //     {
  //       id: 'section-1',
  //       name: 'Model',
  //       image: './images/model.png',
  //       options: [1, 2, 3, 4],
  //     },
  //     {
  //       id: 'section-2',
  //       name: 'Style',
  //       image: './images/style.png',
  //       options: [5, 6, 7, 8, 9],
  //     },
  //     {
  //       id: 'section-3',
  //       name: 'Width',
  //       image: './images/width.png',
  //       options: [10, 11],
  //     },
  //     {
  //       id: 'section-4',
  //       name: 'Height',
  //       image: './images/height.png',
  //       options: [12, 13, 14, 15],
  //     },
  //     {
  //       id: 'section-5',
  //       name: 'Colors',
  //       image: './images/color.png',
  //       options: [16, 17, 18],
  //     },
  //     {
  //       id: 'section-6',
  //       name: 'Handles',
  //       image: './images/handles.png',
  //       options: [16, 17, 18],
  //     },
  //     {
  //       id: 'section-7',
  //       name: 'Legs',
  //       image: './images/legs.png',
  //       options: [19, 20],
  //     },
  //     {
  //       id: 'section-8',
  //       name: 'Worktops',
  //       image: './images/worktops.png',
  //       options: [19, 20],
  //     },
  //   ],
  // };
};

export const getSavedConfiguration = async (id, savedId) => {
  // const API_URL= globalThis.API_URL;
  // const url = `${API_URL}app/configuration/${id}?saved=${savedId}`;
  // const response = await fetch(url);
  // const data = await response.json();
  // return data;
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return {};
};

export const saveConfiguration = async (
  id: string,
  shop: string,
  selectedOptions: { [key: string]: string }
) => {
  const API_URL = globalThis.API_URL;
  // const url = `${API_URL}app/configuration/${id}`;
  const url = `${API_URL}configuration/${id}?shop=${shop}`;
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      name: `saved-configuration-${id}`,
      // photo: ,
      selectedOptions,
    }),
  });
  const data = await response.json();
  return data;
};

export const sendConfigurationEmail = async (formData: {
  [key: string]: string;
}) => {
  const API_URL = globalThis.API_URL;
  const url = `${API_URL}configuration-email/send`;
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(formData),
  });
  const data = await response.json();
  return data;
};

const getUploadUrl = async (
  meta: string,
  payload: {
    filename: string;
    contentType: string;
  }
) => {
  try {
    const API_URL = globalThis.API_URL;
    const url = `${API_URL}configuration-email/${meta}/upload`;
    // sectionId ? `${process.env.REACT_APP_API_HOST}configurations/${meta}/sections/images/upload` :
    //   `${process.env.REACT_APP_API_HOST}configurations/${meta}/images/upload`;
    const res = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: token || '',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (e) {
    console.log(e.message);
  } finally {
  }
};

export const uploadImage = async (meta: string, imageFile: File) => {
  try {
    // setLoadingImages(true);
    const { name: filename, type: contentType } = imageFile;
    const { signedUrl, file } = await getUploadUrl(meta, {
      filename,
      contentType,
    });
    await fetch(signedUrl, {
      method: 'put',
      headers: { 'Content-Type': contentType },
      body: imageFile,
    });
    // callback && callback(meta, file);
  } catch (e) {
    console.error(e.message);
  }
  // finally {
  //   setLoadingImages(false);
  // }
};

export const getSavedConfigurationPhotoFile = async (name: string, savedConfigurationPhoto: string) => {
  const base64Response = await fetch(savedConfigurationPhoto)
  const savedConfigurationPhotoBlob = await base64Response.blob()
  const file = new File([savedConfigurationPhotoBlob], `${name}.png`, {
    type: 'image/png',
  })
  return file
}

export const updateUrlParams = (key: string, value: string) => {
  if ('URLSearchParams' in window) {
    var searchParams = new URLSearchParams(window.location.search)
    searchParams.set(key, value);
    var newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
    history.pushState(null, '', newRelativePathQuery);
  }
  return
}

export const handleSaveConfiguration = async (
  meta: string,
  shop: string,
  selectedOptions: SelectedOptions
) => {
  const selection = Object.keys(selectedOptions).reduce((acc, o) => {
    const selectionItem = {[o]: selectedOptions[o].id}
    return {...acc, ...selectionItem}
  },{})
  const data = await saveConfiguration(meta, shop, selection)
  updateUrlParams('saved', data.meta)

  return data.meta
}

export const getSavedConfigurationUrl = (newSavedConfigurationId: string) => {
  const savedConfigurationUrl = window.location.href.includes('saved')
  ? window.location.href.split('&saved=')[0] +
    `&saved=${newSavedConfigurationId}`
  : window.location.href + `&saved=${newSavedConfigurationId}`
  return savedConfigurationUrl
}

/**
 * Localizes the given price.
 * @param price 
 * @returns Formatted price string.
 */
 declare global {
  interface Window {
      Shopify:any;
  }
}
export const formatPriceToShopStyle = (price: number) => {
  const languageCodes = {
    'a-s-helsingo-se.myshopify.com': 'fi-FI',
    'a-s-helsingo-fi.myshopify.com': 'fi-FI',
    'a-s-helsingo.myshopify.com': 'en-US'
  };

  const fallbackClientPreferredLanguage = window?.navigator?.language || 'en-US';
  const clientPreferredLanguage = languageCodes[window.top.Shopify?.shop] || fallbackClientPreferredLanguage;
  const shopifyPreferredCurrency = window.top?.Shopify?.currency?.active || 'EUR';

  const formattedPrice = new Intl.NumberFormat(clientPreferredLanguage, {
    style: 'currency',
    currency: shopifyPreferredCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 // max decimals
  }).format(price).replace(',', '.'); // dot separator is used on store

  return formattedPrice;
}