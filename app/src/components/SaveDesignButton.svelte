<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { getContext } from 'svelte'
  import type { SelectedOptions } from '../interfaces/selected-options'
  import {
    configuration,
    meta,
    saved,
    shop,
    selectedOptions,
    newSavedConfigurationId,
    sayDuckModelLoading,
    sayDuckPhotoLoading,
    selectedSection,
  } from '../store'
  import { handleSaveConfiguration } from '../api'
  import Button from './Button.svelte'
  import Save from './Save.svelte'

  const { open } = getContext('simple-modal')

  const showModal = async () => {
    $sayDuckPhotoLoading = true;
    
    window.dispatchEvent(
      new CustomEvent('sayduck.viewer.actions.takePhoto', {
        detail: { format: 'png', keepPosition: true, noCrop: true },
      })
    );

    $newSavedConfigurationId = await handleSaveConfiguration($meta, $shop, $selectedOptions)
    
    open(
      Save,
      {},
      {
        styleCloseButton: {
          cursor: 'pointer',
          border: 'none',
          borderRadius: 0,
          boxShadow: 'none',
          background: '#E7E7E7',
          zIndex: 9,
          // background: 'none',
          // transform: 'scale(1.5)'
        },
        styleWindow: {
          width: 'fit-content',
          maxWidth: '1000px',
          borderRadius: 0,
        },
        styleContent: {
          padding: 0,
          maxHeight: '90vh',
          // maxHeight: 'none',
        },
      }
    )
  }
</script>

<Button disabled={$sayDuckModelLoading} type="button" class="btn btn--secondary btn--full" on:click={() => showModal()}>{$_('SAVE_FOR_LATER')}</Button>

<style>
</style>
