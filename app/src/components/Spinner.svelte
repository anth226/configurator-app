<script lang="ts">

</script>

<div id="helsingo-preloader-preview">
	<div id="helsingo-preloader-wrapper">
	<svg id="helsingo-preloader-animation" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" viewBox="0 0 168 168" xml:space="preserve">
		<defs>
		</defs>
		<circle class="circle-center" stroke="none" fill="black" cx="84" cy="84" r="44"/>
		<circle class="dot" cx="0" cy="0" r="63.5" stroke="black" stroke-width="14.95" fill="none" stroke-linecap="round" transform="translate(84,84) rotate(37)"/>
		<circle class="dot" cx="0" cy="0" r="63.5" stroke="black" stroke-width="14.95" fill="none" stroke-linecap="round" transform="translate(84,84) rotate(141)"/>
	</svg>
	</div>
</div>



<style>
#helsingo-preloader-preview {
	display: flex;
	height: 100%;
}

#helsingo-preloader-wrapper {
	width: 80px;
	height: 80px;
	margin: auto;
}

#helsingo-preloader-animation {
	animation: linear 1.2s infinite rotate-dots;
	animation-timing-function: cubic-bezier(0.7,0.25,0.3,0.75);
	transform-origin: 50% 50%;
}

#helsingo-preloader-animation .dot {
	animation-name: dash-dots;
	animation-duration: 0.6s;
	animation-direction: alternate;
	animation-timing-function: cubic-bezier(0.75,0,1,1);
	animation-iteration-count: infinite;
}

@keyframes rotate-dots {
  to {
		transform: rotate(360deg);
  }
}

@keyframes dash-dots {
	from {
		stroke-dasharray: 0.1,399.9;
    stroke-dashoffset: -200;
	}
  to {
		stroke-dasharray: 16,384;
    stroke-dashoffset: -192;
  }
}

@media only screen and (max-width: 1024px) {
	#helsingo-preloader-wrapper {
		margin: 30vh auto 0;
	}
}

</style>