<script lang="ts">
  import { _ } from 'svelte-i18n'
  import Button from './Button.svelte'
  import ClipboardCopy from './ClipboardCopy.svelte'
  import FormSubmitSuccess from './FormSubmitSuccess.svelte'
  import { getContext } from 'svelte'
  import {
    lang,
    action,
    configuration,
    selectedDetails,
    newSavedConfigurationId,
    savedConfigurationPhoto,
    toggleFormSuccess,
    configurationProductType
  } from '../store'
  import { Action } from '../interfaces/action'
  import { sendConfigurationEmail, uploadImage, getSavedConfigurationUrl, getSavedConfigurationPhotoFile } from '../api/index'

  const resetAction = () => ($action = Action.INFO)

  // const savedConfigurationUrl = window.location.href.includes('saved')
  //   ? window.location.href.split('&saved=')[0] +
  //     `&saved=${$newSavedConfigurationId}`
  //   : window.location.href + `&saved=${$newSavedConfigurationId}`

  // let copied: boolean = false
  // const handleCopy = () => {
  //   copied = true
  //   setTimeout(() => copied = false, 5000)
  // }

  

  let formData: { [key: string]: string } = {
    firstName: '',
    lastName: '',
    email: '',
    savedConfigurationUrl: '',
    savedConfigurationPhoto: '',
  }

  const handleChange = () => {
    checkValidData()
  }

  let checked: boolean = false
  const handleCheck = () => {
    checked = !checked
    handleChange()
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    await uploadImage(
      $newSavedConfigurationId,
      await getSavedConfigurationPhotoFile($newSavedConfigurationId, $savedConfigurationPhoto)
    )
    const API_URL = globalThis.API_URL
    formData.savedConfigurationPhoto = `${API_URL}images/${$newSavedConfigurationId}.png?size=original`
    formData.savedConfigurationUrl = getSavedConfigurationUrl($newSavedConfigurationId)

    const response = await sendConfigurationEmail({
      email: formData.email,
      firstname: formData.firstName,
      lastname: formData.lastName,
      save_my_design_language: $lang.toLowerCase() === 'sv' ? 'se' : $lang,
      save_my_design_product_category: $configurationProductType,
      save_my_design_model: $selectedDetails.model,
      save_my_design_style: $selectedDetails.style,
      save_my_design_width: $selectedDetails.width,
      save_my_design_height: $selectedDetails.height,
      save_my_design_all_colour: $selectedDetails.color,
      save_my_design_door_colour: $selectedDetails.color,
      save_my_design_side_panel_colour: $selectedDetails.color,
      save_my_design_handle_model: $selectedDetails.handles.toLowerCase().replaceAll(' ', '') === 'pushopen' ? 'push-open' : $selectedDetails.handles,
      save_my_design_leg_model: $selectedDetails.legs,
      save_my_design_tabletop: $selectedDetails.worktops,
      save_my_design_price: $selectedDetails.totalShopifyPrice.toString(),
      save_my_design_url: formData.savedConfigurationUrl,
      save_my_design_image_url: formData.savedConfigurationPhoto,
    })
    $toggleFormSuccess = true
  }

  let hasValidData = false
  const checkValidData = () => {
    hasValidData =
      formData.email && formData.firstName && formData.lastName && checked
        ? true
        : false
  }
</script>

<div class="save-container">
  <!-- {#if $savedConfigurationPhoto} -->
  <div class="save-image">
    <img  alt="" src={$savedConfigurationPhoto} />
  </div>
  <!-- {/if} -->

  <div class="save-content rte">
    <!-- <p>Copy the link to your saved configuration by clicking the button below</p> -->
    <h1 class="save__title">{$_('SAVE_TITLE')}</h1>
    <p class="save__subtitle">{$_('SAVE_SUBTITLE')}</p>
    <!-- <ClipboardCopy text={savedConfigurationUrl} let:copy on:copy={handleCopy}>
      <Button on:click={copy}>Copy Configuration Link</Button>
    </ClipboardCopy>
    {#if copied}
    <span class="text-green">Link copied to clipboard</span>
    {/if} -->
    <form class="form-container form-vertical">
      <div class="grid">
        <div class="grid__item one-half">
          <label for="firstName">{$_('SAVE_FIRSTNAME')}</label>
          <input
            on:change={() => handleChange()}
            bind:value={formData.firstName}
            type="text"
            id="firstName"
            name="firstName"
            class="input-full"
            required
          />
        </div>
        
        <div class="grid__item one-half">
          <label for="lastName">{$_('SAVE_LASTNAME')}</label>
          <input
            on:change={() => handleChange()}
            bind:value={formData.lastName}
            type="text"
            id="lastName"
            name="lastName"
            class="input-full"
          />
        </div>
        
        <div class="grid__item one-whole">
          <label for="email">{$_('SAVE_EMAIL')}</label>
          <input
            on:change={() => handleChange()}
            bind:value={formData.email}
            type="email"
            id="email"
            class="input-full"
            name="email"
          />
        </div>

        <div class="grid__item one-whole">
          <label>
            <input
              on:click={() => handleCheck()}
              type="checkbox"
              id="checkbox"
              style="margin-top: 4px;"
              bind:checked
            />
            <div>
              <p>
                {$_('SAVE_CHECKBOX') + ' '}
                <a style="border-bottom: unset;" href={$_('SAVE_LINK_HREF')}>{$_('SAVE_LINK_TEXT')}</a>
              </p>
            </div>
          </label>
        </div>
        <div class="grid__item one-whole">
          <div class="actions">
            <Button
              class="btn btn--primary btn--full"
              style="margin-top: 0px;"
              disabled={!hasValidData}
              type="submit"
              on:click={(e) => handleSubmit(e)}>{$_('SAVE_BUTTON')}</Button>
          </div>
        </div>
      </div>
    </form>
    {#if $toggleFormSuccess}
      <FormSubmitSuccess />
    {/if}
  </div>
</div>

<style>
  .save-container {
    display: flex;
    flex-direction: row;
  }

  .save-content {
    display: flex;
    flex-direction: column;
    text-align: center;
    margin: 48px auto 32px;
    max-width: 480px;
  }

  .save__title {
    margin-bottom: 25px;
    font-family: Quarto-Light_64b;
  }

  .save__subtitle {
    font-size: 1.1em;
    line-height: 1.65;
  }

  .save-container .save-image {
    /* max-width: 800px; */
    /* object-fit: contain; */
    width: 46%;
    background: #ebebeb; /* Same as on SayDuck3D.svelte */
    display: grid;
    place-content: center;
  }

  .save-container .save-image img {
    max-height: 100%;
    margin: 0 auto 0;
  }

  .actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 8px auto;
  }

  label {
    display: flex;
  }

  label p {
    margin: 0;
  }

  @media screen and (max-width: 1024px) {
    .save-container {
      flex-direction: column;
      align-items: center;
    }
    .save-container .save-image {
      /* max-width: 800px; */
      /* object-fit: contain; */
      width: 100%;
      height: 30vh;
      overflow: hidden;
      position: relative;
    }
    .save-content {
      margin: 32px 16px;
    }
    .actions {
      margin-top: 24px;
    }
    .save-container .save-image img {
      height: 100%;
      position: absolute;
      display: block;
      width: 100%;
      object-fit: contain;
    }
  }
</style>
