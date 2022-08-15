<script lang="ts">
  import { beforeUpdate, onMount, onDestroy } from 'svelte'
  import { _ } from 'svelte-i18n'
  import Options from './Options.svelte'
  import Button from './Button.svelte'
  import ConfigurationProductInfo from './ConfigurationProductInfo.svelte'
  // import Icon from './Icon.svelte'
  // import Checkmark from '../assets/checkmark.svg'
  import type { Option } from '../interfaces/option'
  import {
    selectedOptions,
    filteredProductGroup,
    configurationProductIds,
    configurationProductIdsGroupedByProductType,
    configuration,
    selectedSection,
    loadingProductActions,
    toast,
    shouldPerformScroll,
    selectedDetails,
    selectedProductSummary,
    slideAnimation,
    hasSpecialCase
  } from '../store'
  import type { SelectedOptions } from '../interfaces/selected-options'
  import type { Action } from '../interfaces/action'
  export let handleAction = (action: Action) => {}
  const API_URL = globalThis.API_URL
  const dynamicSectionImage = ['color', 'handles', 'legs', 'worktops']

  let isMobileSize = window.innerWidth <= 1024 ? true : false
  let isChangingSections = false

  const handleScreenResize = () => {
    if(window.innerWidth <= 1024) return isMobileSize = true
    if(window.innerWidth > 1024) return isMobileSize = false
  }
  
  // const isMobile = () => {
  //   try {
  //     document.createEvent('TouchEvent');
  //     return true;
  //   } catch (e) {
  //     return false;
  //   }
  // }

  $: getSection = (id: string) => {
    const section = $configuration.sections.find((s) => s.id === id)
    return section
  }

  $: handleSelectSection = (id: string) => {
    if ($selectedSection !== id) {
      isChangingSections = true
      animateSlideOut()
      setTimeout(() => {
        $toast.show = false
        $selectedSection = id
        isChangingSections = false
        $hasSpecialCase = false
      }, $slideAnimation.duration)
    }
    return
  }

  $: handleOptionGoBack = () => {
    animateSlideOut()
    setTimeout(() => {
      $toast.show = false
      $selectedSection = null
    }, $slideAnimation.duration)
  }
  // $: if(!$slideAnimation) animateSlideIn()

  const animateSlideIn = () => setTimeout(() => {
    $slideAnimation.shouldAnimate = true
    $slideAnimation.type = 'animate-in'
  }, $slideAnimation.duration)
  const animateSlideOut = () => {
    $slideAnimation.shouldAnimate = true
    $slideAnimation.type = 'animate-out'
    animateSlideIn()
  }

  $: if(isMobileSize && !$selectedSection) {
    handleSelectSection($configuration.sections[0].id)
  }

  onMount(() => window.addEventListener('resize', handleScreenResize))
  onDestroy(() => window.removeEventListener('resize', handleScreenResize))

  // $: performScroll = () => {
  //   setTimeout(() => {
  //     const nextSection = $configuration.sectionOrder.filter(
  //       (s) => !Object.keys($selectedOptions).includes(s)
  //     )[0]
  //     const element = document.getElementById(nextSection)
  //     const scrollToId = (e) =>
  //       e.scrollIntoView({ behavior: 'smooth', block: 'center' })
  //     if (element && element) scrollToId(element)
  //     $shouldPerformScroll = false
  //   }, 1000)
  // }
</script>

{#if !isMobileSize}
<div class={`configuration ${$slideAnimation.shouldAnimate ? $slideAnimation.type : 'visible'}`}>
  <div class="sections-container {$selectedSection ? '__configurator-mobile' : ''}">
    <h2 class="__configurator-desktop">{$_('CONFIGURE')}</h2>
    <div class="section-container">
      {#each $configuration.sections as section}
        <div
          id={section.id}
          class="section {$selectedSection === section.id
            ? 'selected-section'
            : ''}"
          on:click={() => handleSelectSection(section.id)}
        >
          <img
            
            class="__configurator-desktop"
            src={dynamicSectionImage.includes(section.name.toLowerCase()) && $selectedOptions[section.id] 
            ? `${API_URL}images/${$selectedOptions[section.id].photo}?size=original` 
            : `${API_URL}images/${section.photo}?size=original`}
            alt={section.name}
          />
          <div class="section-label">
            <span class="label">{$_(`${section.name.toUpperCase()}`)}</span>
            <!-- icon next to section label version -->
            <!-- {#if Object.keys($selectedOptions).includes(section.id)}
              <span class="icon">
                <Icon Icon={Checkmark} />
              </span>
            {/if} -->
          </div>
        </div>
      {/each}
    </div>
  </div>
  {#if $selectedSection}
    <Options
      section={getSection($selectedSection)}
      on:click={() => handleOptionGoBack()}
    />
  {/if}
  <div class="configuration-product-info__wrapper">
    <!-- {#if $selectedSection}
      <div class="actions">
        <Button class="nav" centered icon on:click={() => ($selectedSection = null)}
          >{$_('BACK_TO_OTHER_OPTIONS')}</Button
        >
      </div>
    {/if} -->
    <ConfigurationProductInfo />
  </div>
</div>
{/if}

{#if isMobileSize}
<!-- <div class={`configuration`}> -->
  
  <div class="sections-container">
    <h2 class="__configurator-desktop">{$_('CONFIGURE')}</h2>
    <div class="section-container">
      {#each $configuration.sections as section}
        <div
          id={section.id}
          class="section {$selectedSection === section.id
            ? 'selected-section'
            : ''}"
          on:click={() => handleSelectSection(section.id)}
        >
          <div class="section-label">
            <span class="label">{$_(`${section.name.toUpperCase()}`)}</span>
          </div>
        </div>
      {/each}
    </div>
    <div class="scroll-fade"></div>
  </div>

  <div class="options-mobile-wrapper {isChangingSections && $hasSpecialCase ? 'options-mobile-wrapper-minimum-height' : ''}">
  <div class={`options-mobile-container ${$slideAnimation.shouldAnimate ? $slideAnimation.type : ''}`}>
  {#if $selectedSection}
    <Options
      section={getSection($selectedSection)}
      on:click={() => handleOptionGoBack()}
    />
  {/if}
  </div>
  </div>

  <div class="configuration-product-info__wrapper">
    <ConfigurationProductInfo />
  </div>

<!-- </div> -->
{/if}

<style>
  .configuration {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    /* height: 100%; */

    position: absolute;

    /* transform: translateX(100%);
    transition: transform 2s ease-in-out; */

    right: -150%;
    transition: right 0.4s ease-in-out
  }

  .animate-in {
    position: relative;
    right: 0;
  }

  .animate-out {
    position: absolute !important;
    right: -150% !important;
  }

  .visible {
    position: relative !important;
    right: 0 !important;
  }

  .sections-container h2 {
    border-bottom: solid 1px;
    border-bottom-color: var(--color-light-gray);
    line-height: 1;
    padding-bottom: 16px;
    margin: 0 32px;
    text-align: center;
    color: var(--color-medium-gray);
    font-size: 1.2em;
  }

  .section-container {
    overflow-y: auto;
    /* max-height: 650px; */
    /* height calculated by deducting the height of the ConfigurationProductInfo.svelte component height and shop (theme) navigation bar*/
    max-height: calc(100vh - 217px - 74px);
  }

  .section {
    cursor: pointer;
    width: 100%;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    margin: 16px 0;
    padding: 8px 0;
  }

  /* .section-label {
    font-size: 16px;
    align-items: center;
    display: grid;
    grid-template-columns: 0.5fr 1fr 0.5fr;
    grid-column-gap: 5px;
    justify-items: center;
    width: 70px;
  }

  .section-label .label {
    grid-column-start: 2;
  }
  .section-label .icon {
    margin-left: auto;
  } */

  /*  */
  .section-label {
    font-size: 16px;
    position: relative;
    align-items: center;
    justify-items: center;
  }

  .section-label .label {
  }

  .section-label .icon {
    margin-left: auto;
    position: absolute;
    margin-left: 5px;
    top: 50%;
    transform: translateY(-50%);
  }
  /*  */

  .section img {
    /* width: auto; */
    /* max-height: 70px; */
    max-width: 200px;
  }

  .actions {
    height: 50px;
    display: flex;
    justify-content: center;
    border-top: 1px solid var(--color-light-gray);
    padding: 0 16px;
  }

  .options-mobile-wrapper {
    position: relative;
    min-height: 129px;
  }

  .options-mobile-container {
    position: absolute;
    left: 150%;
    transition: all 0.4s ease-in-out;
  }

  @media screen and (max-width: 1024px) {
    .configuration {
      justify-content: flex-start;
      position: relative;
      right: 0;
    }

    .configuration-product-info__wrapper {
      border-top: solid 1px #eeeff0;
    }

    .animate-out {
      position: absolute !important;
      left: 1000px !important;
    }

    .animate-in {
      position: relative !important;
      left: 0 !important;
    }

    .section-container {
      /* width: 100%; */
      display: flex;
      flex-direction: row;
      background-color: var(--color-gray);
      position: relative;
      padding-right: 80px;
      /* overflow-y: scroll; */
    }

    .sections-container { 
      position: relative;
    }
    .scroll-fade {
      width: 120px;
      height: 100%;
      background: linear-gradient(to right, rgba(231,231,231,0), var(--color-gray));
      right: 0;
      top: 0;
      display: block;
      content: "";
      position: absolute;
      pointer-events: none;
    }

    .section {
      min-width: fit-content;
      padding: 10px 20px;
      margin: 16px 0 16px 16px;
    }

    .selected-section {
      background: var(--color-white);
      border-radius: 0px;
    }

    .actions {
      display: none;
    }

    .options-mobile-wrapper-minimum-height {
      min-height: 199px;
    }
  }

  @media only screen and (min-width: 1025px) {
    .section-label {
      padding: 10px 30px;
      margin-top: 5px;
    }
  }
</style>
