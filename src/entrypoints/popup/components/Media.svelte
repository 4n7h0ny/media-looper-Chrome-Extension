<script lang="ts">
  import {getTinyContextForce, useRow} from "@/lib/tinybase/tinybase-stores";
  import {getThumbUrl} from "@/lib/helpers/youtube";
  import {A, Tooltip} from "flowbite-svelte";
  import type {Media} from "@/lib/model";

  let {id}: {id: string} = $props()

  const store = getTinyContextForce('store')

  const media = useRow<Media>(store, 'medias', id)

  let videoId = $derived(id.startsWith('youtube:') ? id.substring(8) : '')
  let isYoutube = $derived(id.startsWith('youtube:'))
</script>

{#if isYoutube}
  <A href="https://www.youtube.com/watch?v={videoId}" target="_blank">
    <img src={getThumbUrl(videoId, 'default')} alt={$media.title}/>
  </A>
{:else}
  <div class="placeholder" aria-label={$media.title} title={$media.title}>
    {$media.title}
  </div>
{/if}
<Tooltip>{$media.title}</Tooltip>

<style>
    .placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 120px;
        height: 90px;
        background: #111827;
        color: #e5e7eb;
        padding: 8px;
        text-align: center;
        border-radius: 8px;
        font-size: 12px;
        box-sizing: border-box;
    }
</style>
