<script lang="ts">
  import {locationStore} from "@/lib/stores/location";
  import LoopsController from "@/lib/components/LoopsController.svelte";
  import {logoData} from "@/lib/misc/app-icon";
  import {setupStore} from "@/lib/stores/core";
  import * as amplitude from '@amplitude/analytics-browser';
  import {channelListener, channelSender, pullListener, runtimeOnMessageSender} from "@/lib/misc/browser-network";
  import {setTinyContext} from "@/lib/tinybase/tinybase-stores";
  import {createLocalPersister} from "tinybase/persisters/persister-browser";
  import type {Id} from "tinybase";
  import ActiveLoop from "@/lib/components/ActiveLoop.svelte";
  import JumpBack from "@/lib/components/JumpBack.svelte";
  import type {MediaProvider} from "@/lib/providers";
  import {googlePhotosProvider} from "@/lib/providers";

  let {provider = googlePhotosProvider}: {provider?: MediaProvider} = $props()
  let currentLocation = $state(location.href)

  $effect(() => {
    const unsubscribe = locationStore.subscribe((value) => currentLocation = value)

    return () => unsubscribe()
  })

  const ctx = setupStore({
    listener: channelListener(pullListener(), 'tiny-sync'),
    sender: channelSender(runtimeOnMessageSender, 'tiny-sync'),
    localOptions: {
      listener: channelListener(pullListener({pullInterval: 5000}), 'tiny-sync-local-settings'),
      sender: channelSender(runtimeOnMessageSender, 'tiny-sync-local-settings'),
      persister: (store) => createLocalPersister(store, 'youtube-looper-tb-local')
    }
  });

  setTinyContext(ctx)

  let mediaId = $derived(provider.idFromUrl(currentLocation))
  let sourceId = $derived(mediaId ? provider.sourceIdFromMediaId(mediaId) : null) as string | null

  let activeLoop = $state(null) as Id | null;
  let popupVisible = $state(false) as boolean;

  $effect.pre(() => {
    sourceId
    activeLoop = null
    popupVisible = false
  })

  let activeComponent: ActiveLoop | undefined = $state()
  let controllerComponent: LoopsController | undefined = $state()
  let jumpBackComponent: JumpBack | undefined = $state();
  let progressTarget = $derived(() => document.querySelector('video')?.parentElement || document.body)

  function log(event: string, details?: {[key: string]: any}) {
    amplitude.track(event, {sourceId, ...details})
  }

  function loopLogDetail(loopId: Id) {
    return {label: ctx.store.getCell('loops', loopId, 'label')}
  }

  function toggleVisible() {
    if (popupVisible) {
      amplitude.track('Open Dialog', {sourceId})
      popupVisible = false
    } else {
      amplitude.track('Close Dialog', {sourceId})
      popupVisible = true
    }
  }

  function playLoop(loopId: Id) {
    if (!sourceId) return

    ctx.store.setCell('medias', sourceId, 'lastLoopPlay', Date.now())

    activeLoop = loopId
  }

  function selectLoop(e: any) {
    const id = e.id

    if (activeLoop === id) {
      log('Stop Loop', loopLogDetail(id))

      activeLoop = null
    } else {
      if (activeLoop) log('Stop Loop', loopLogDetail(activeLoop))

      log('Start Loop', loopLogDetail(id))

      playLoop(id)
    }
  }

  function shortcutsHandler(e: KeyboardEvent) {
    if (e.altKey && e.code === "KeyV") {
      toggleVisible();
    }
    if (e.altKey && e.code === "KeyZ") {
      if (activeComponent) {
        activeComponent.seekStart(e.shiftKey ? 3 : 0);
      } else {
        if (controllerComponent) controllerComponent.record();
      }
    }
    if (e.altKey && e.code === "KeyX") {
      if (activeLoop) {
        log("Stop Loop", loopLogDetail(activeLoop));
        activeLoop = null;
      }
    }
    if (e.altKey && e.code === "KeyS") {
      if (controllerComponent) {
        controllerComponent.decreaseSpeed(e.shiftKey);
      }
    }
    if (e.altKey && e.code === "KeyD") {
      if (controllerComponent) {
        controllerComponent.increaseSpeed(e.shiftKey);
      }
    }
    if (e.altKey && e.code === "KeyF") {
      if (controllerComponent) {
        controllerComponent.setSpeed(1);
      }
    }
    if (e.altKey && e.code === "KeyG") {
      if (controllerComponent) {
        controllerComponent.setSpeed(2);
      }
    }
    if (e.altKey && e.code.match(/^Digit[1-9]$/)) {
      if (controllerComponent) {
        const speed = parseInt(e.code.slice(-1)) / 10;
        controllerComponent.setSpeed(speed);
      }
    }
    if (e.altKey && e.code === "KeyB") {
      if (jumpBackComponent) {
        jumpBackComponent.backToStart();
      }
    }
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css" />
</svelte:head>

<svelte:document on:keydown={shortcutsHandler} />

{#await ctx.ready then x}
  {#if sourceId}
    <button class="ml-button" onclick={toggleVisible}>
      <div class="button-inner-container">
        <img src={logoData} alt="Media Looper" />
      </div>
    </button>

    {#if activeLoop}
      <ActiveLoop id={activeLoop} bind:this={activeComponent} {progressTarget}/>
    {/if}

    {#if popupVisible}
      <div class="ml-popup">
        <LoopsController
            {sourceId}
            {activeLoop}
            onselect={selectLoop}
            bind:this={controllerComponent}
            {provider}
        />
        <JumpBack bind:this={jumpBackComponent} />
      </div>
    {/if}
  {/if}
{/await}

<style>
  .ml-button {
      position: fixed;
      right: 16px;
      bottom: 16px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(0,0,0,0.7);
      border: 1px solid rgba(255,255,255,0.1);
      z-index: 999999;
      padding: 0;
      cursor: pointer;
  }

  .button-inner-container {
      width: 100%;
      height: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
  }

  .ml-button img {
      display: block;
      width: 28px;
  }

  .ml-popup {
      position: fixed;
      right: 16px;
      bottom: 72px;
      width: 500px;
      max-height: 80vh;
      background: rgba(24,24,27,0.98);
      color: white;
      z-index: 999999;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
  }
</style>
