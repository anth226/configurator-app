<script lang="ts">
  import {beforeUpdate, onMount} from 'svelte'
  import { _ } from 'svelte-i18n'
  import Button from './Button.svelte'
  import type { Section } from '../interfaces/section'
  import type { Option } from '../interfaces/option'
  import {
    selectedOptions,
    filteredProductGroup,
    configurationProductIds,
    selectedSection,
    toast,
    shouldPerformScroll,
    selectedDetails,
    hasSpecialCase
  } from '../store'
  export let section: Section
  const API_URL = globalThis.API_URL
  const doubleRowLayout = ['color', 'handles', 'legs', 'worktops']
  const woodMaterialNames = ['naturaloak', 'naturalwalnut', 'smokeoak', 'whiteoak']

  const selectOption = (section: Section, option: Option) => {
    // reset toast contents
    $toast.specialCaseContent = ''
    $toast.content = ''

    let hasSpecialCase = false
    
    selectedOptions.selectOption(section.id, option)

    //handle special cases
    // if model samso is, no handles
    if (Object.values($selectedOptions).find(s => s.name.toLowerCase() === 'samsö') 
        && (section.name.toLowerCase() === 'handles' || section.name.toLowerCase() === 'model')) {
      $toast.specialCaseContent = $_('SPECIAL_CASE_SAMSO_NO_HANDLES')
      hasSpecialCase = true
    }
    // if model ensio + height 236, no wood
    if (Object.values($selectedOptions).find(s => s.name.toLowerCase() === 'ensiö') 
        && Object.values($selectedOptions).find(s => s.name.toLowerCase().replace(' ', '') === '236cm')
        && (section.name.toLowerCase() === 'height' || section.name.toLowerCase() === 'model')) {
      $toast.specialCaseContent = $_('SPECIAL_CASE_ENSIO_236_NO_WOOD')
      hasSpecialCase = true
    }
    // if ensiö and wood materials are chosen, no height 236
    if (Object.values($selectedOptions).find(s => woodMaterialNames.includes(s.name.toLowerCase().replace(' ', ''))) 
        && Object.values($selectedOptions).find(s => s.name.toLowerCase() === 'ensiö')
        && (section.name.toLowerCase() === 'color' || section.name.toLowerCase() === 'model')) {
      $toast.specialCaseContent = $_('SPECIAL_CASE_ENSIO_WOOD_NO_236')
      hasSpecialCase = true
    }
    if (Object.values($selectedOptions).find(s => woodMaterialNames.includes(s.name.toLowerCase().replace(' ', ''))) 
        && Object.values($selectedOptions).find(s => s.name.toLowerCase().replace(' ', '') === '236cm')
        && (section.name.toLowerCase() === 'height' || section.name.toLowerCase() === 'color')) {
      $toast.specialCaseContent = $_('SPECIAL_CASE_236_WOOD_NO_ENSIO')
      hasSpecialCase = true
    }
 
    $toast.content = `${$_(section.name.toUpperCase().replaceAll(' ',''), {default: section.name})}: ${$_(option.name.toUpperCase().replaceAll(' ',''), {default: option.name})}`
    $toast.show = true

    // getSelectedOptionDetails(section, option)

    setTimeout(() => {
      $toast.show = false
      // $selectedSection = null
      // $shouldPerformScroll = true
    }, hasSpecialCase ? $toast.duration * 10 : $toast.duration)
  }

  $: isSelected = (sectionId: string, optionId: Option) => {
    return (
      $selectedOptions &&
      $selectedOptions[sectionId] &&
      $selectedOptions[sectionId] === optionId
    )
  }

  $: specialCase_samsoNoHandles = false
  $: specialCase_ensio236NoWood = false
  $: specialCase_ensioWoodNo236 = false
  $: specialCase_height236WoodNoEnsio = false

  $: if(section) {
    // reset all special cases if the section changes
    specialCase_samsoNoHandles = false
    specialCase_ensio236NoWood = false
    specialCase_ensioWoodNo236 = false
    specialCase_height236WoodNoEnsio = false
  }
  
  const specialCaseSamsoNoHandles = (section: Section) => {
    // if samsö is chosen, only 'no handles' option is available in the handles section
    return section.name.toLowerCase() === 'handles' 
        && Object.values($selectedOptions).find(s => s.name.toLowerCase() === 'samsö')
  }

  const specialCaseEnsio236NoWood = (section: Section) => {
    // if ensiö and height 236 are chosen, wood color options are disabled
    return section.name.toLowerCase() === 'color' 
    && Object.values($selectedOptions).find(s => s.name.toLowerCase() === 'ensiö') 
    && Object.values($selectedOptions).find(s => s.name.toLowerCase().replace(' ', '') === '236cm')
  }

  const specialCaseEnsioWoodNo236 = (section: Section) => {
    // if ensiö and a wood color are chosen, no height 236 is available
    return section.name.toLowerCase() === 'height' 
    && Object.values($selectedOptions).find(s => woodMaterialNames.includes(s.name.toLowerCase().replace(' ', ''))) 
    && Object.values($selectedOptions).find(s => s.name.toLowerCase() === 'ensiö') 
  }

  const specialCaseHeight236WoodNoEnsio = (section: Section) => {
    // if height 236 and a wood color are chosen, ensiö model is not available
    return section.name.toLowerCase() === 'model' 
    && Object.values($selectedOptions).find(s => woodMaterialNames.includes(s.name.toLowerCase().replace(' ', ''))) 
    && Object.values($selectedOptions).find(s => s.name.toLowerCase().replace(' ', '') === '236cm')
  }
</script>

<div class="options-container">
  <div class="options-title-container">
    <!--
      make .options-section__title to be left aligned if enabled.
    <Button class="nav" icon on:click>{$_('BACK')}</Button>
    -->
    <h2 class="options-section__title">{$_(`${section.name.toUpperCase().replaceAll(' ','')}`, {default: section.name})}</h2>
  </div>
  <div class="options">
    {#each section.options.slice().sort((a, b) => {
      return (
        section.optionOrder.indexOf(a.id) -
        section.optionOrder.indexOf(b.id)
      );
    }).filter(o => {
      if(specialCaseSamsoNoHandles(section)) {
        specialCase_samsoNoHandles = true
        $hasSpecialCase = true
        // return o.name.toLowerCase() === 'no handles'
      }
      if(specialCaseEnsio236NoWood(section)) {
        specialCase_ensio236NoWood = true
        $hasSpecialCase = true
      }
      if(specialCaseEnsioWoodNo236(section)) {
        specialCase_ensioWoodNo236 = true
        $hasSpecialCase = true
      }
      if(specialCaseHeight236WoodNoEnsio(section)) {
        specialCase_height236WoodNoEnsio = true
        $hasSpecialCase = true
      }
      return o
    }) as option}
      <div
        class="option
        {doubleRowLayout.includes(section.name.toLowerCase()) 
          ? 'double-row' 
          : 'single-row'}
        {isSelected(section.id, option) 
          ? 'selected' 
          : ''} 
        {specialCase_samsoNoHandles && option.name.toLowerCase().replace(' ',  '') !== 'nohandles' 
          ? 'special-case-disabled-option' 
          : ''}
        {specialCase_ensio236NoWood && woodMaterialNames.includes(option.name.toLowerCase().replace(' ', '')) 
          ? 'special-case-disabled-option' 
          : ''}
        {specialCase_ensioWoodNo236 && option.name.toLowerCase().replace(' ',  '') === '236cm' 
          ? 'special-case-disabled-option' 
          : ''}
        {specialCase_height236WoodNoEnsio && option.name.toLowerCase().replace(' ',  '') === 'ensiö' 
          ? 'special-case-disabled-option' 
          : ''}
          "
        on:click={() => selectOption(section, option)}
      >
        <div class="option__image">
          <img src={option.photo
              ? `${API_URL}images/${option.photo}?size=original`
              : `images/default-img.png`}
            alt={section.name}
          />
        </div>
        <div class="option__name"><span class="clamp">{$_(`${option.name.toUpperCase().replaceAll(' ','')}`, {default: option.name})}</span></div>
      </div>
    {/each}
    {#if specialCase_samsoNoHandles && section.name.toLowerCase() === 'handles'}
    <div class="special-case-notification-container text-gray __configurator-desktop-flex">
      <p class="special-case-notification-text">{$_('SPECIAL_CASE_SAMSO_NO_HANDLES')}</p>
    </div>
    {:else if specialCase_ensio236NoWood && section.name.toLowerCase() === 'color'}
    <div class="special-case-notification-container text-gray __configurator-desktop-flex">
      <p class="special-case-notification-text">{$_('SPECIAL_CASE_ENSIO_236_NO_WOOD')}</p>
    </div>
    {:else if specialCase_ensioWoodNo236 && section.name.toLowerCase() === 'height'}
    <div class="special-case-notification-container text-gray __configurator-desktop-flex">
      <p class="special-case-notification-text">{$_('SPECIAL_CASE_ENSIO_WOOD_NO_236')}</p>
    </div>
    {:else if specialCase_height236WoodNoEnsio && section.name.toLowerCase() === 'model'}
    <div class="special-case-notification-container text-gray __configurator-desktop-flex">
      <p class="special-case-notification-text">{$_('SPECIAL_CASE_236_WOOD_NO_ENSIO')}</p>
    </div>
  {/if}
  </div>
  <div class="actions">
    <Button class="nav with-icon" centered icon on:click>{$_('BACK')}</Button>
  </div>
</div>
{#if specialCase_samsoNoHandles && section.name.toLowerCase() === 'handles'}
    <div class="special-case-notification-container text-gray __configurator-mobile-flex">
      <p class="special-case-notification-text">{$_('SPECIAL_CASE_SAMSO_NO_HANDLES')}</p>
    </div>
    {:else if specialCase_ensio236NoWood && section.name.toLowerCase() === 'color'}
    <div class="special-case-notification-container text-gray __configurator-mobile-flex">
      <p class="special-case-notification-text">{$_('SPECIAL_CASE_ENSIO_236_NO_WOOD')}</p>
    </div>
    {:else if specialCase_ensioWoodNo236 && section.name.toLowerCase() === 'height'}
    <div class="special-case-notification-container text-gray __configurator-mobile-flex">
      <p class="special-case-notification-text">{$_('SPECIAL_CASE_ENSIO_WOOD_NO_236')}</p>
    </div>
    {:else if specialCase_height236WoodNoEnsio && section.name.toLowerCase() === 'model'}
    <div class="special-case-notification-container text-gray __configurator-mobile-flex">
      <p class="special-case-notification-text">{$_('SPECIAL_CASE_236_WOOD_NO_ENSIO')}</p>
    </div>
  {/if}

<style>
  .options-container {
    display: flex;
    height: 100%;
    flex-flow: column;
    /* height calculated by deducting the height of the ConfigurationProductInfo.svelte component height and shop (theme) navigation bar*/
    max-height: calc(100vh - 184px - 74px);
    max-width: 433px;
  }

  .options-title-container {
    border-bottom: solid 1px;
    border-bottom-color: var(--color-light-gray);
    margin: 0 32px;
    padding-bottom: 16px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .options-title-container .options-section__title {
    line-height: 1;
    text-align: center;
    color: var(--color-medium-gray);
    flex: 1 0 auto;
    font-size: 1.2em;
  }

  .options {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    overflow-y: auto;
    align-items: start;
    /* max-height: 700px; */
    /* border-bottom: 1px solid var(--color-light-gray); */
  }

  .option__image {
    display: grid;
    place-content: center;
  }

  .option {
    cursor: pointer;
    display: flex;
    flex-flow: column;
    /* justify-content: space-between; */
    align-items: center;
    padding: 16px 0;
    text-align: center;
    /* Fit option container if only one option is available e.g. Samsö + no handles */
    height: fit-content;
  }

  .option.single-row {
    width: 100%;
  }

  .option.double-row {
    width: 50%;
  }

  .option.single-row img {
    max-width: 325px;
  }

  .option.double-row img {
    max-width: 162px;
  }

  .selected {
    background: var(--color-selected-gray);
  }

  .actions {
    height: 50px;
    min-height: 50px;
    display: flex;
    justify-content: center;
    border-top: solid 1px;
    border-top-color: var(--color-light-gray);
    padding: 0 32px;
  }

  .clamp {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* number of lines to show */
    -webkit-box-orient: vertical;
  }

  @media screen and (min-width: 1025px) {
    .option__name {
      max-width: 175px;
      margin-top: 8px;
    }

    .clamp {
      -webkit-line-clamp: 1; /* number of lines to show */
    }
    .actions {
      margin-top: auto;
    }
    .option.double-row .option__image {
      height: 120px;
    }
  }

  .special-case-disabled-option {
    opacity: 0.1;
    pointer-events: none;
  }

  .special-case-notification-container {
    display: flex;
    justify-content: center;
    padding: 32px;
    width: 100%;
    /* background-color: var(--color-selected-gray); */
  }

  .special-case-notification-text {
    display: flex;
    text-align: center;
    align-items: center;
    margin: 0;
  }

  @media screen and (max-width: 1024px) {
    .options-title-container,
    .actions {
      display: none;
    }

    .option__image {
      height: 60px;
    }

    .options-container {
      display: flex;
      flex-direction: row;
      max-width: none;
      /* border-bottom: 1px solid #eeeff0; */
    }

    .options {
      flex-wrap: nowrap;
      border: none;
      height: fit-content;
      align-items: center;
    }

    .option {
      justify-content: flex-start;
      /* padding: 8px 16px; */
      /* height: 150px !important; */
      min-width: 125px !important;
      padding:  0;
      min-height: 128px;
      height: 100%;
      padding-top: 12px;
    }

    .option.single-row,
    .option.double-row {
      width: auto;
      /* max-height: 120px; */
    }

    .option img {
      width: 50px;
      height: auto;
      max-height: 50px;
    }

    .option__name {
      height: 36px;
      max-width: 90px;
      margin-top: 6px;
      line-height: normal;

      display: grid;
      place-content: center;
    }

    .actions {
      display: none;
    }

    .special-case-notification-container {
      border-top: 1px solid #eeeff0;
      padding: 0 18px;
      min-height: 71px;
    }
  }
</style>
