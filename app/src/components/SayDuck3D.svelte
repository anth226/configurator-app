<script lang="ts">
  import {
    configuration,
    selectedOptions,
    savedConfigurationPhoto,
    sayDuckModelLoading,
    sayDuckPhotoLoading,
    selectedSayDuckOptions
  } from '../store'

  $: if ($selectedOptions) {
    $sayDuckModelLoading = true
    window.dispatchEvent(
      new CustomEvent(
        'sayduck.configurator.actions.updateSelectedConfiguration',
        {
          detail: $selectedSayDuckOptions
        }
      )
    )
    // console.log("sayduck.configurator.actions.updateSelectedConfiguration")
    $sayDuckModelLoading = false
  }

  document.addEventListener(
    'sayduck.viewer.gltf.loaded',
    async () => {
      window.dispatchEvent(
        new CustomEvent(
          'sayduck.configurator.actions.updateSelectedConfiguration',
          {
            detail: $selectedSayDuckOptions
          }
        )
      )
      // console.log("sayduck.viewer.gltf.loaded")
      $sayDuckModelLoading = false
    },
    false
  )

  document.addEventListener(
    'sayduck.configurator.selectedConfigurationUpdated',
    (e: CustomEvent) => {
      // console.log("sayduck.configurator.selectedConfigurationUpdated")
      // $sayDuckModelLoading = false
    },
    false
  )

  document.addEventListener('sayduck.viewer.photoTaken', (e: CustomEvent) => {
    $savedConfigurationPhoto = e.detail.dataUrl
    $sayDuckPhotoLoading = false
  })

  const dataViewerOptions = JSON.stringify({
    appearance: {
      // 'background': 'light',
      'background-advanced': {
        'color': '#ebebeb'
      },
      "theme-color": {"red": 0, "green": 0, "blue": 0, "alpha": 150},
      // 'hide-photo-studio': true,
      'hide-embed': true,
      'hide-photo-studio': true,
      'hide-picker': true,
      'hide-hand-hint': true
    },
    controls: {
      // "no-pan": true
    },
    configurations: {
      initial: $selectedSayDuckOptions
    }
  })
</script>

<div class="sayduck-3d-viewer-wrap">
  <div
    id="sayduck-3d-viewer-container"
    data-product-uuid={$configuration.sayduckProductId}
    data-viewer-options={dataViewerOptions}
  >
    <script
      defer
      type="text/javascript"
      src="https://viewer.sayduck.com"></script>
  </div>
  <!-- <div 
    id="sayduck-3d-configurator-picker-container" 
    style="position: relative; bottom: 0; max-width: calc(100% - 600px); background: rgba(0,0,0,0.2); border-top-right-radius: 10px; padding: 16px;">
    <script defer src="https://configurator-picker.sayduck.com"></script>
  </div> -->
</div>

<style>
  #sayduck-3d-viewer-container {
    position: absolute;
    /* top: 0; */
    /* min-height: 650px; */
    /* min-width: 500px; */
    width: 100%;
    height: 100%;
  }

  @media screen and (max-width: 1024px) {
    #sayduck-3d-viewer-container {
      position: relative;
      /* min-height: 470px; */
      /* min-height: 220px; */
      min-height: calc(50vh - 60px);
    }
  }
</style>
