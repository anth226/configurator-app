import App from './App.svelte';

declare const CONFIGURATOR_CONFIG: {target: string}

const app = () => {
  if (typeof CONFIGURATOR_CONFIG === 'undefined' || !CONFIGURATOR_CONFIG) {
    throw new Error('Widget not configured properly');
  }
  const {target = ''} = CONFIGURATOR_CONFIG;

  return new App({
   target: document.querySelector(`#${target}`) || document.body,
   props: {},
  })
}

export default app();
