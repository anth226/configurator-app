<script lang="ts">
import { onMount } from 'svelte';
import {
	configuration,
	selectedOptions,
	loading,
	shop,
	shopCurrency,
	meta,
	saved,
	savedOptions,
	lang,
	configurationProductIds,
	configurationProductIdsGroupedByProductType,
	loadingProductActions,
	selectedDetails,
	filteredProductGroup,
	selectedProductSummary,
	selectedIkeaProductSummary,
	selectedSayDuckOptions,
	sayDuckModelLoading,
	newSavedConfigurationId,
	configurationProductType,
	togglePopup
} from './store'
import type { SelectedOptions } from './interfaces/selected-options'
import type { IkeaProduct, IkeaProductGroup } from './interfaces/ikea-product'
import type { Section } from './interfaces/section'
import Navigation from './components/Navigation.svelte';
import { getConfiguration, getSavedConfiguration } from './api';
import { getCart } from './api/shopify';
import FloatingActions from './components/FloatingActions.svelte';
import ProductViewer from './components/ProductViewer.svelte';
import Spinner from './components/Spinner.svelte'
import Popup from './components/Popup.svelte'
import { initI18n } from './i18n/i18n'

// fetch("https://api.sayduck.io/graphql",
//   {
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     method: 'POST',
//     body: JSON.stringify(
//     {
//       query: `query GetPublicProduct {
//       publicProduct(uuid: "95948290-37ab-0139-7626-6a34df65f06f") {
//         name
//         model {
//           liveConfigurations {
//             nodes {
//               name
//               uuid
//               liveVariants {
//                 nodes {
//                   name
//                   uuid
//                   swatchColour
//                 }
//               }
//               parent {
//                 name
//                 uuid
//               }
//             }
//           }
//         }
//       }
//     }`
//   })
// })
// .then((res) => res.json())
// .then((result) => console.log("SAYDUCK",result.data.publicProduct))

const ikeaProducts: {[key: string]: IkeaProduct[]} = {
	sideboard: [
  {
    name_en: "METOD Wall cabinet frame, white 40x37x40 cm",
    name_fi: "METOD Seinäkaapin runko, valkoinen, 40x37x40 cm",
    name_sv: "METOD Väggskåpsstomme, vit 40x37x40 cm",
    sku: "102.055.29",
    price_eur: "21",
    price_sek: "139",
		productType: "frame",
		handle: "Metod"
  },
  {
    name_en: "METOD Wall cabinet frame, white 40x37x60 cm",
    name_fi: "METOD Seinäkaapin runko, valkoinen, 40x37x60 cm",
    name_sv: "METOD Väggskåpsstomme, vit 40x37x60 cm",
    sku: "102.055.34",
    price_eur: "23",
    price_sek: "179",
		productType: "frame",
		handle: "Metod"
  },
  {
    name_en: "METOD Wall cabinet frame, white 40x37x80 cm",
    name_fi: "METOD Seinäkaapin runko, valkoinen, 40x37x80 cm",
    name_sv: "METOD Väggskåpsstomme, vit 40x37x80 cm",
    sku: "702.055.31",
    price_eur: "25",
    price_sek: "199",
		productType: "frame",
		handle: "Metod"
  },
  {
    name_en: "METOD Wall cabinet frame, white 80x37x40 cm",
    name_fi: "METOD Seinäkaapin runko, valkoinen, 80x37x40 cm",
    name_sv: "METOD Väggskåpsstomme, vit 80x37x40 cm",
    sku: "802.055.40",
    price_eur: "32",
    price_sek: "229",
		productType: "frame",
		handle: "Metod"
  },
  {
    name_en: "METOD Wall cabinet frame, white 80x37x60 cm",
    name_fi: "METOD Seinäkaapin runko, valkoinen, 80x37x60 cm",
    name_sv: "METOD Väggskåpsstomme, vit 80x37x60 cm",
    sku: "602.055.22",
    price_eur: "35",
    price_sek: "279",
		productType: "frame",
		handle: "Metod"
  },
  {
    name_en: "METOD Wall cabinet frame, white 80x37x80 cm",
    name_fi: "METOD Seinäkaapin runko, valkoinen, 80x37x80 cm",
    name_sv: "METOD Väggskåpsstomme, vit 80x37x80 cm",
    sku: "702.055.26",
    price_eur: "38",
    price_sek: "319",
		productType: "frame",
		handle: "Metod"
  },
  {
    name_en: "Hinge w b-in damper for kitchen 110 °, 2 pcs",
    name_fi: "UTRUSTA Keittiösarana + sis.rak. vaimennin 110 °, 2 kpl",
    name_sv: "Gångjärn m inbyggd dämpare för kök 110 °, 2 styck",
    sku: "404.017.84",
    price_eur: "15",
    price_sek: "119",
		productType: "hinge"
  },
  {
    name_en: "EKET Adjustable leg, 4pcs",
    name_fi: "EKET Säädettävä jalka, metalli, 4 kpl",
    name_sv: "EKET Justerbar fot, 4 styck",
    sku: "703.400.44",
    price_eur: "5",
    price_sek: "50",
		productType: "leg"
  },
  {
    name_en: "METOD Suspension rail, 200 cm",
    name_fi: "METOD Kiinnityskisko, sinkitty, 200 cm",
    name_sv: "METOD Upphängningsskena, 200cm",
    sku: "602.056.64",
    price_eur: "20",
    price_sek: "139",
		productType: "rail"
  },
  {
    name_en: "UTRUSTA Shelf, 40x37 cm, 2 pcs",
    name_fi: "UTRUSTA Hyllylevy, lasi 40x37 cm, 2 kpl",
    name_sv: "UTRUSTA Hyllplan, glas 40x37 cm",
    sku: "202.133.31",
    price_eur: "14",
    price_sek: "99",
		productType: "shelf"
  },
  {
    name_en: "UTRUSTA Shelf, 80x37 cm, 2 pcs",
    name_fi: "UTRUSTA Hyllylevy, lasi 80x37 cm, 2 kpl",
    name_sv: "UTRUSTA Hyllplan, glas 80x37 cm",
    sku: "202.056.04",
    price_eur: "20",
    price_sek: "139",
		productType: "shelf"
  },
],
wardrobe: [
	{
    name_en: "PAX Wardrobe frame, white 50x35x201 cm",
    name_fi: "PAX Vaatekaapin runko, valkoinen 50x35x201 cm",
    name_sv: "PAX Garderobsstomme, vit 50x35x201 cm",
    sku: "602.145.69",
    price_eur: "45",
    price_sek: "495",
		productType: "frame",
		handle: "Pax"
  },
	{
    name_en: "PAX Wardrobe frame, white 50x58x201 cm",
    name_fi: "PAX Vaatekaapin runko, valkoinen 50x58x201 cm",
    name_sv: "PAX Garderobsstomme, vit 50x58x201 cm",
    sku: "702.145.59",
    price_eur: "55",
    price_sek: "595",
		productType: "frame",
		handle: "Pax"
  },
	{
    name_en: "PAX Wardrobe frame, white 50x35x236 cm",
    name_fi: "PAX Vaatekaapin runko, valkoinen 50x35x236 cm",
    name_sv: "PAX Garderobsstomme, vit 50x35x236 cm",
    sku: "402.145.65",
    price_eur: "55",
    price_sek: "595",
		productType: "frame",
		handle: "Pax"
  },
	{
    name_en: "PAX Wardrobe frame, white 50x58x236 cm",
    name_fi: "PAX Vaatekaapin runko, valkoinen 50x58x236 cm",
    name_sv: "PAX Garderobsstomme, vit 50x58x236 cm",
    sku: "802.145.68",
    price_eur: "65",
    price_sek: "695",
		productType: "frame",
		handle: "Pax"
  },
	{
    name_en: "PAX Wardrobe frame, white 100x35x201 cm",
    name_fi: "PAX Vaatekaapin runko, valkoinen 100x35x201 cm",
    name_sv: "PAX Garderobsstomme, vit 100x35x201 cm",
    sku: "902.145.63",
    price_eur: "65",
    price_sek: "645",
		productType: "frame",
		handle: "Pax"
  },
	{
    name_en: "PAX Wardrobe frame, white 100x58x201 cm",
    name_fi: "PAX Vaatekaapin runko, valkoinen 100x58x201 cm",
    name_sv: "PAX Garderobsstomme, vit 100x58x201 cm",
    sku: "202.145.66",
    price_eur: "75",
    price_sek: "745",
		productType: "frame",
		handle: "Pax"
  },
	{
    name_en: "PAX Wardrobe frame, white 100x35x236 cm",
    name_fi: "PAX Vaatekaapin runko, valkoinen 100x35x236 cm",
    name_sv: "PAX Garderobsstomme, vit 100x35x236 cm",
    sku: "002.145.72",
    price_eur: "75",
    price_sek: "745",
		productType: "frame",
		handle: "Pax"
  },
	{
    name_en: "PAX Wardrobe frame, white 100x58x236 cm",
    name_fi: "PAX Vaatekaapin runko, valkoinen 100x58x236 cm",
    name_sv: "PAX Garderobsstomme, vit 100x58x236 cm",
    sku: "502.145.60",
    price_eur: "85",
    price_sek: "845",
		productType: "frame",
		handle: "Pax"
  },
	{
    name_en: "KOMPLEMENT Soft closing hinge, 3 pcs",
    name_fi: "KOMPLEMENT Sarana, pehmeästi sulkeutuva, 3 kpl",
    name_sv: "KOMPLEMENT Mjukstängande gångjärn, 3 styck",
    sku: "002.145.05",
    price_eur: "15",
    price_sek: "150",
		productType: "hinge"
  },
	{
    name_en: "KOMPLEMENT Soft closing hinge, 4 pcs",
    name_fi: "KOMPLEMENT Sarana, pehmeästi sulkeutuva, 4 kpl",
    name_sv: "KOMPLEMENT Mjukstängande gångjärn, 4 styck",
    sku: "302.145.04",
    price_eur: "20",
    price_sek: "200",
		productType: "hinge"
  },
]
}

const actionErrorCheck = (configurationSections: Section[]) => {

	const sectionsWithErrors = configurationSections.reduce((acc, s) => {

		const optionsArray = s.options.reduce((acc, o) => {
			const optionsWithErrors = o.actions.filter(a => (a.type === 'discard'  && !a.filteredProductFeatures.length || a.type === 'filter'  && !a.filteredProductFeatures.length))
			if (optionsWithErrors.length) return [...acc, {[s.name]: {[o.name]: [...optionsWithErrors]}}]
			return [...acc]
		}, [])

		if(optionsArray.length) return [...acc, ...optionsArray]
		return [...acc]
	}, [])

	if(sectionsWithErrors.length) {
		console.error("Found sections with errors: ", sectionsWithErrors)
		return $togglePopup = {show: true, content: 'Error found in the Configuration settings. Please try again later.'}
	}

	return
}

const getSelectedSayduckModel = (selectedOptions: SelectedOptions, configurationProductType: string) => {
	const modelMap = ['samsö', "ensiö", "ingarö"]
	const selectedModel = Object.values(selectedOptions).reduce((acc, o) => {
		if (modelMap.includes(o.name.toLowerCase())) return o.name.toLowerCase()
		return acc
	}, '')
	

	const studioIdsArray = [
    "6ade7870-af09-0139-b3b8-12876e4721b9", // ground variant
    "6ae03910-af09-0139-f836-12876e4721b9", // wall variant
    "6ae2b700-af09-0139-e868-12876e4721b9" // leg variant
	]

	const woodColorsArray = [
		"97eb9860-5e28-0139-0af7-46c2030f29fb", // white oak sideboard
		"d532b660-5e28-0139-0584-46c2030f29fb", // natural oak sideboard
		"eb36a140-5e28-0139-47c3-46c2030f29fb", // smoke oak sideboard
		"59207640-5e2f-0139-370c-46c2030f29fb", // walnut sideboard
		"6381c890-7d99-0139-634b-3691ac32dd62", // white oak wardrobe
		"63826750-7d99-0139-e3fb-3691ac32dd62", // natural oak wardrobe
		"63830360-7d99-0139-71d0-3691ac32dd62", // smoke oak wardrobe
		"63856e60-7d99-0139-2716-3691ac32dd62", // walnut wardrobe
	]

	const ensiöWoodDoorModelMap = {
		sideboard: {key: "29fa2ba0-37af-0139-6fc7-6a34df65f06f", value: "a44f8eb0-3d50-0139-166a-4e3d9982ad0a"},
		wardrobe: {key: "e6a99e50-6889-0139-f97f-46d5d5beff2f", value: "0eac2fd0-688e-0139-01be-46d5d5beff2f"}
	}

	//set default worktop to be disabled
	// $selectedSayDuckOptions = {
	// 	"abbc8780-3d54-0139-c259-4e3d9982ad0a": null
	// }

	const sayDuckOptions = Object.values(selectedOptions).filter(o => o.sayduckIds)
	const sayDuckArray = sayDuckOptions.map(o => o.sayduckIds)
	const sayDuckList = sayDuckArray.reduce((acc, obj) => {
		if(Object.keys(obj).length === 1) return [...acc, obj]
		if(Object.keys(obj).length > 1) {
			const arr = Object.keys(obj).map(key => ({[key]: obj[key]}))
			return [...acc, ...arr]
		}
	}, [])

	const sayDuckFilter = sayDuckList.reduce((acc, obj) => {
		const key = Object.keys(obj)[0]
		if (!acc[key]) {
			acc[key] = obj[key];
		}
		acc[key] = acc[key].filter(id => obj[key].includes(id))

		return acc;
	}, {})

	Object.keys(sayDuckFilter).map(key => {
		//set Studio uuid based on chosen leg options
		if(studioIdsArray.includes(key)) {
			$selectedSayDuckOptions["6add5ea0-af09-0139-70f2-12876e4721b9"] = key
		}

		//set Ensiö_wood door model if selected model is Ensiö and door material is wood
		if(selectedModel === 'ensiö' && woodColorsArray.includes(sayDuckFilter[key][0])) {
			$selectedSayDuckOptions[ensiöWoodDoorModelMap[configurationProductType].key] = ensiöWoodDoorModelMap[configurationProductType].value
		}
		
		$selectedSayDuckOptions[key] = sayDuckFilter[key][0]
	})

}

const filterIkeaProductGroup = (ikeaProducts: IkeaProduct[], productType: string) => {

	const ikeaProductGroup: {[key: string]: IkeaProductGroup[]} = {}
	
	if (productType === 'sideboard') {
		//get frame
		if($selectedDetails.hasSpacerPanels === true) {
			const frame = ikeaProducts.filter(i => i.name_en.includes(`40x37x${$selectedDetails.height}`))

			ikeaProductGroup['frame'] = frame.map(f => ({...f, count: parseInt($selectedDetails.width)/40}))
		}

		if($selectedDetails.hasSpacerPanels === false) {
			const frame = ikeaProducts.filter(i => i.name_en.includes(`40x37x${$selectedDetails.height}`) || i.name_en.includes(`80x37x${$selectedDetails.height}`))
			
			ikeaProductGroup['frame'] = frame.map(f => {
				if (f.name_en.includes(`80x37x${$selectedDetails.height}`)) 
					return {...f, count: Math.floor(parseInt($selectedDetails.width)/80)}
				if (f.name_en.includes(`40x37x${$selectedDetails.height}` ) && parseInt($selectedDetails.width) % 80 !== 0) 
					return {...f, count: 1}
			}).filter(f => f !== undefined)
		}

		//get hinge
		const hingeCount = ikeaProductGroup['frame'].reduce((acc, f) => {
			
			let count = 0
			if(f.name_en.includes(`80x37x${$selectedDetails.height}`)) count = f.count * 2
			if(f.name_en.includes(`40x37x${$selectedDetails.height}`)) count = f.count * 1
			
			return acc + count
		}, 0)
		
		ikeaProductGroup['hinge'] = [{...ikeaProducts.find(i => i.productType === 'hinge'), count: hingeCount}]

		//get shelf
		ikeaProductGroup['shelf'] = ikeaProductGroup['frame'].reduce((acc, f) => {
			const shelf = ikeaProducts.find(i => {
				if(f.name_en.includes(`80x37x${$selectedDetails.height}`)) 
				return i.name_en.includes(`80x37`) && i.productType === 'shelf'
				if(f.name_en.includes(`40x37x${$selectedDetails.height}`)) 
				return i.name_en.includes(`40x37`) && i.productType === 'shelf'
			})

			return [...acc, {...shelf, count: f.count}]
		}, [])

		//get leg
		if($selectedDetails.hasLegs) ikeaProductGroup['rail'] = [{...ikeaProducts.find(i => i.productType === 'rail'), count: 1}]
		if(!$selectedDetails.hasLegs) ikeaProductGroup['leg'] = [{...ikeaProducts.find(i => i.productType === 'leg'), count: 1}]
	}

	if (productType === 'wardrobe') {
		const wardrobeDepthMap = {['38']: '35', ['60']: '58', ['']: '35'}
		const wardrobeHingeMap = {['201']: '3 pcs', ['236']: '4 pcs'}
		if($selectedDetails.hasSpacerPanels === true) {
			const frame = ikeaProducts.filter(i => i.name_en.includes(`50x${wardrobeDepthMap[$selectedDetails.depth]}x${$selectedDetails.height}`))

			ikeaProductGroup['frame'] = frame.map(f => ({...f, count: parseInt($selectedDetails.width)/50}))
		}

		if($selectedDetails.hasSpacerPanels === false) {
			const frame = ikeaProducts.filter(i => i.name_en.includes(`50x${wardrobeDepthMap[$selectedDetails.depth]}x${$selectedDetails.height}`) || i.name_en.includes(`100x${wardrobeDepthMap[$selectedDetails.depth]}x${$selectedDetails.height}`))

			ikeaProductGroup['frame'] = frame.map(f => {
				if (f.name_en.includes(`100x${wardrobeDepthMap[$selectedDetails.depth]}x${$selectedDetails.height}`)) 
					return {...f, count: Math.floor(parseInt($selectedDetails.width)/100)}
				if (f.name_en.includes(`50x${wardrobeDepthMap[$selectedDetails.depth]}x${$selectedDetails.height}`) && parseInt($selectedDetails.width) % 100 !== 0) 
					return {...f, count: 1}
			}).filter(f => f !== undefined)
		}

		const hingeCount = ikeaProductGroup['frame'].reduce((acc, f) => {
			
			let count = 0
			if(f.name_en.includes(`100x${wardrobeDepthMap[$selectedDetails.depth]}x${$selectedDetails.height}`)) count = f.count * 2
			if(f.name_en.includes(`50x${wardrobeDepthMap[$selectedDetails.depth]}x${$selectedDetails.height}`)) count = f.count * 1
			
			return acc + count
		}, 0)

		const TEST = ikeaProducts.find(i => i.name_en.includes(wardrobeHingeMap[$selectedDetails.height]))
		
		ikeaProductGroup['hinge'] = [{...ikeaProducts.find(i => i.name_en.includes(wardrobeHingeMap[$selectedDetails.height])), count: hingeCount}]
	}

	//calculate ikea prices
	const ikeaTotal = Object.values(ikeaProductGroup).reduce((acc, i) => {
		const productTypeTotal = i.reduce((acc, p) => {
			if($shopCurrency.currency === 'EUR') return acc + (parseInt(p.price_eur) * p.count)
			if($shopCurrency.currency === 'SEK') return acc + (parseInt(p.price_sek) * p.count)
		}, 0)

		return acc + productTypeTotal
	}, 0)
	
	$selectedIkeaProductSummary = ikeaProductGroup
	$selectedDetails.ikeaProductList = Object.values($selectedIkeaProductSummary).reduce((acc, i) => {
  $selectedDetails.frame = $selectedIkeaProductSummary['frame'][0].handle

		const productLine = i.reduce((acc, ip) => {
        const line = {name: ip[`name_${$lang}`], count: ip.count, sku: ip.sku, }
        return [...acc, line]
      }, [])

      return [...acc, ...productLine]
    }, [])
	$selectedDetails.totalIkeaPrice = ikeaTotal
}

const filterProductGroup = (selectedOptions: SelectedOptions) => {
$loadingProductActions = true

const productGroup = $configuration.products.reduce((acc, p) => {
		const key = p.productType;
		if (!acc[key]) {
			acc[key] = { products: [], count: 1 };
		}
		acc[key].products.push(p.id);
		return acc;
	}, {})

const discardActions = Object.values(selectedOptions).reduce((acc, option) => {
		const filteredActionArray = option.actions.filter(a => a.type === 'discard')
		return [...acc, ...filteredActionArray] 
}, [])


if (discardActions.length) discardActions.forEach(a => {
	// TODO should we allow actions to go through without a product array
	if(productGroup[a.filteredProductType])
	productGroup[a.filteredProductType].products = productGroup[a.filteredProductType].products.filter(p => !a.filteredProductFeatures.includes(p))
})

const filterActions = Object.values(selectedOptions).reduce((acc, option) => {
		const filteredActionArray = option.actions.filter(a => a.type === 'filter')
		return [...acc, ...filteredActionArray] 
}, [])


if (filterActions.length) filterActions.forEach(a => {
	// TODO should we allow actions to go through without a product array
	if(productGroup[a.filteredProductType])
	productGroup[a.filteredProductType].products = productGroup[a.filteredProductType].products.filter(p => a.filteredProductFeatures.includes(p))
})

const countActions = Object.values(selectedOptions).reduce((acc, option) => {
		const filteredActionArray = option.actions.filter(a => a.type === 'count')
		return [...acc, ...filteredActionArray] 
}, [])

if (countActions.length) countActions.forEach(a => {
	// TODO should we allow actions to go through without a product array
	if(productGroup[a.filteredProductType])
	productGroup[a.filteredProductType].count = parseInt(a.count)
})

$filteredProductGroup = productGroup

$selectedProductSummary = Object.keys($filteredProductGroup).reduce((acc, p: any) => {
	const foundProduct = $configuration.products.find(product => product.id === $filteredProductGroup[p].products[0]) 
	if(foundProduct) {
		const foundPrice = foundProduct.price
		const foundTitle = foundProduct.title
		const foundSku = foundProduct.sku
		const foundbaseProductTitle = foundProduct.baseProductTitle || "Testing Base Product Title"

		const productLine = $filteredProductGroup[p].products.length 
			? {productId: $filteredProductGroup[p].products[0], count: $filteredProductGroup[p].count, price: parseFloat(foundPrice), title: foundTitle, baseProductTitle: foundbaseProductTitle, sku: foundSku} 
			: {}

		return {...acc, [p]: {...productLine}}
	}
	return {...acc}
}, {})


$selectedDetails.shopifyProductList = Object.values($selectedProductSummary).filter(p => Object.keys(p).length)

$loadingProductActions = false
}

const getSelectedOptionDetails = (selectedOptions: SelectedOptions, productType: string) => {
    const detailsArray = ['model', 'width', 'height', 'depth', 'style', 'color', 'worktops', 'handles', 'legs']
    const detailsMapKeyToLabel = {['Plain']: '39', ['Spacer Panels']: '41', ['Frame']: '40'}
		const isWardrobe = productType === 'wardrobe' ? true : false
	
    Object.keys(selectedOptions).forEach(sectionId => {
      const section = $configuration.sections.find((s) => s.id === sectionId)
      const option = selectedOptions[sectionId]

      if(detailsArray.includes(section.name.toLowerCase())) $selectedDetails = {...$selectedDetails, [section.name.toLowerCase()]: option.name.replace(' cm', ''), [section.name.toLowerCase()+'Image']: option.photo}

			if(!isWardrobe) $selectedDetails = {...$selectedDetails, depth: detailsMapKeyToLabel[$selectedDetails.style]}

      if($selectedDetails.style) $selectedDetails = {...$selectedDetails, hasSpacerPanels: $selectedDetails.style.toLowerCase().replace(' ', '') === 'spacerpanels' ? true : false}

			if($selectedDetails.legs) $selectedDetails = {...$selectedDetails, hasLegs: $selectedDetails.legs.toLowerCase().replace(' ', '') === 'nolegs' ? false : true}
    })

		if(Object.keys($selectedProductSummary)) {
      $selectedDetails.totalShopifyPrice = Object.values($selectedProductSummary).reduce((acc, p) => {
				if(p.price) return acc + (p.price * p.count)
				return acc
      }, 0)
    }

  }

const currencyMap = {EUR: '€', SEK: 'kr', DKK: 'dkk'}
const search = location.search.substring(1);
const queryParams = JSON.parse(`{"${decodeURI(search.toLowerCase()).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"')}"}`);

$lang = queryParams.lang 
	? queryParams.lang.toLowerCase()
	: 'fi'
initI18n({ withLocale: $lang });

	onMount(async () => {
		try {
			$loading = true;
			// const search = location.search.substring(1);
			// const queryParams = JSON.parse(`{"${decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"')}"}`);
			$shop = queryParams.shop
			$shopCurrency = {currency: queryParams.shopcurrency.toUpperCase(), symbol: currencyMap[queryParams.shopcurrency.toUpperCase()]}
			const promises = [];
			if (queryParams.configuration) {
				$meta = queryParams.configuration
				promises.push(getConfiguration(queryParams.configuration, queryParams.shop, queryParams.saved));
			} else {
				promises.push(Promise.resolve({}));
			}
			if (queryParams.saved) {
				$saved = queryParams.saved
				promises.push(getSavedConfiguration(queryParams.configuration, queryParams.saved));
			}

			const data = await Promise.all(promises);
			$configuration = data[0];
			$configurationProductType = $configuration.productType.toLowerCase()
			$configurationProductIds = $configuration.products.map(p => {
				return {productType: p.productType, id:p.id}
			})
			$configurationProductIdsGroupedByProductType = $configuration.products.reduce((acc, p) => {
				const key = p.productType;
				if (!acc[key]) {
					acc[key] = { products: [], count: 1 };
				}
				acc[key].products.push(p.id);
				return acc;
    	}, {})

			if (data[0].saved && data[0].saved.selectedOptions) {
				const savedObj = data[0].saved.selectedOptions
			
				const foundSections = data[0].sections.filter(section => Object.keys(savedObj).includes(section.id))
		
				const foundOptions = foundSections.reduce((acc, section) => {
					const foundOption = section.options.find(option => Object.values(savedObj).includes(option.id))
					return {...acc, [section.id]: foundOption}
				}, {})

				$savedOptions = foundOptions
			}
			selectedOptions.init($savedOptions || {}/*data[1]*/);
			
			//filter products and find selection details from a saved configuration
			if(Object.keys($selectedOptions)) {
				actionErrorCheck($configuration.sections)
				filterProductGroup($selectedOptions)
				getSelectedOptionDetails($selectedOptions, $configurationProductType)
				filterIkeaProductGroup(ikeaProducts[$configurationProductType], $configurationProductType)
				getSelectedSayduckModel($selectedOptions, $configurationProductType)
			} 
		} catch (e) {
			console.error('Error parsing querystring: ', e.message)
		} finally {
			$loading = false;
		}
	});

	$: if ($selectedOptions && $configuration) {
		actionErrorCheck($configuration.sections)

		// set handles to 'No handles' if Samsö model is selected
		if(Object.values($selectedOptions).find(s => s.name.toLowerCase() === 'samsö')) {
			const handleSection = $configuration.sections.find(s => s.name.toLowerCase() === 'handles')
			const noHandleOption = handleSection.options.find(o => o.name.toLowerCase() === 'no handles')
			selectedOptions.selectOption(handleSection.id, noHandleOption)
		}

		$sayDuckModelLoading = true
    filterProductGroup($selectedOptions)
    getSelectedOptionDetails($selectedOptions, $configurationProductType)
		filterIkeaProductGroup(ikeaProducts[$configurationProductType], $configurationProductType)
		getSelectedSayduckModel($selectedOptions, $configurationProductType)
  }
</script>

<div class="__configurator-widget">

	{#if $loading}
	<div class="loading-configurator">
		<Spinner />
	</div>
	{/if}
	{#if $configuration}
	<section class="configurator">
		<div class="main">
			<ProductViewer />
			<!-- <FloatingActions /> -->
		</div>
		{#if $togglePopup.show}
			<Popup />
		{/if}
		<Navigation visible={!$loading} disabled={$loadingProductActions}/>
	</section>
	{/if}
</div>

<style>
	/* Global Styles */
	:global(*) {
		box-sizing: border-box;
		-ms-overflow-style: none;
  	scrollbar-width: none;
	}

	:global(*::-webkit-scrollbar) {
		display: none;
	}

	.__configurator-widget :global(h1, h2, h3, h4, h5, h6) {
		margin: 0;
		padding: 0;
		color: var(--color-black);
		font-weight: 300;
	}

	.__configurator-widget :global(h1) {
		font-size: 32px;
	}

	.__configurator-widget :global(h2) {
		font-size: 24px;
		font-family: var(--typeBasePrimary),var(--typeBaseFallback);
	}

	.__configurator-widget :global(h3) {
		font-size: 18px;
	}

	.__configurator-widget :global(h4, h5) {
		font-size: 16px;
	}

	.__configurator-widget :global(span:not(.reset), p) {
		font-size: 15px;
		font-weight: 300;
	}

	.__configurator-widget :global(a) {
		font-size: 14px;
		color: var(--color-black);
		text-decoration: none;
		border-bottom: 1px solid var(--color-black)
	}

	.__configurator-widget :global(a:visited) {
		color: var(--color-black);
	}

	.__configurator-widget :global(.mt-2) {
		margin-top: 2em;
	}

	.__configurator-widget :global(.mt-1) {
		margin-top: 1em;
	}

	.__configurator-widget :global(.my-1) {
		margin: 1em 0;
	}

	.__configurator-widget :global(.my-2) {
		margin: 2em 0;
	}

	.__configurator-widget :global(.text-gray) {
  	color: var(--color-dark-gray);
	}

	.__configurator-widget :global(.text-green) {
		color: var(--color-green)
	}

	.__configurator-widget :global(.text-bold) {
		font-family: "Circular-Bold";
	}
	.__configurator-widget :global(.text-italic) {
		font-style: italic;
	}

	 :global(.__configurator-mobile, .__configurator-mobile-flex) {
		display: none !important;
	}

	:global(.__configurator-desktop) {
		display: block !important;
	}

	 :global(.__configurator-desktop-flex) {
		display: flex !important;
	}

	.__configurator-widget :global(.ikea-price-label) {
    border: 1px solid var(--color-dark-gray);
    padding: 0 2px;
    font-size: 12px;
  }

	/* end Global Styles */
	:root {
		--color-gray: #E7E7E7;
		--color-dark-gray: #878787;
		--color-medium-gray: #474747; 
		--color-light-gray: rgba(151, 151, 151, 0.4);
		--color-selected-gray: #EFEFEF;
		--color-white: #ffffff;
		--color-black: #0F0F0F;
		--color-green: #10814A;
	}

	.__configurator-widget {
		height: 100%
	}

	.configurator {
		background: var(--color-gray);
		display: flex;
		flex-direction: row;
		flex: 1;
		height: 100%;
		font-size: 14px;
		position: relative;
	}

	.main {
		position: relative;
		flex: 1;
	}

	.loading-configurator {
		/* position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0; */
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}

	

	/* Media Queries */
	@media screen and (max-width: 1024px) {
		.configurator {
			flex-direction: column;
			/* font-size: 14px; */
			/* background-color: red; */
		}

		:global(.__configurator-mobile) {
			display: block !important;
		}

		:global(.__configurator-mobile-flex) {
			display: flex !important;
		}

		:global(.__configurator-desktop, .__configurator-desktop-flex) {
			display: none !important;
		}

		.__configurator-widget :global(span:not(.reset), p) {
			font-size: 13px;
		}

		.__configurator-widget :global(a) {
			font-size: 13px;
		}
	}

	/* End Media Queries*/

</style>