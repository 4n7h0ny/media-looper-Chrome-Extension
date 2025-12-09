<script lang="ts">
  import {getTinyContextForce, useQueriesResultTable, useRow} from "@/lib/tinybase/tinybase-stores";
  import {A, Button, Modal, TableBodyCell, TableBodyRow} from "flowbite-svelte";
  import {ExclamationCircleOutline, TrashBinOutline} from "flowbite-svelte-icons";
  import {deleteMedia} from "@/lib/controller";
  import {getThumbUrl} from "@/lib/helpers/youtube";
  import {sp} from "@/lib/helpers/events";
  import type {Media} from "@/lib/model";

  let {id}: {id: string} = $props()

  let showDeleteModal = $state(false)
  let isYoutube = $derived(id.startsWith('youtube:'))
  let videoId = $derived(isYoutube ? id.substring(8) : '')

  const store = getTinyContextForce('store')
  const queries = getTinyContextForce('queries')
  const relationships = getTinyContextForce('relationships')

  const media = useRow<Media>(store, 'medias', id)

  let loops = $derived(useQueriesResultTable(queries, "loopsQ:" + id, 'loops', ({select, where}) => {
    select('startTime')
    select('endTime')
    select('label')
    where('source', id)
  }))

  function remove() {
    deleteMedia(store, relationships, id)
  }

  </script>

<TableBodyRow on:click>
  <TableBodyCell class="min-w-[120px]">
    {#if isYoutube}
      <A href="https://www.youtube.com/watch?v={videoId}" target="_blank" on:click={sp}>
        <img src={getThumbUrl(videoId, 'default')} alt="{$media.title}" />
      </A>
    {:else}
      <div class="placeholder" aria-label={$media.title} title={$media.title}>
        {$media.title}
      </div>
    {/if}
  </TableBodyCell>
  <TableBodyCell>{$media.channel}</TableBodyCell>
  <TableBodyCell>{$media.title}</TableBodyCell>
  <TableBodyCell>{Object.entries($loops).length}</TableBodyCell>
  <TableBodyCell>
    <A on:click={(e) => {showDeleteModal = true; sp(e)}}><TrashBinOutline size="md" /></A>
  </TableBodyCell>
</TableBodyRow>

<Modal bind:open={showDeleteModal} size="xs" autoclose>
  <div class="text-center">
    <ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
    <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete {$media.title}?</h3>
    <Button color="red" class="me-2" on:click={remove}>Yes, I'm sure</Button>
    <Button color="alternative">No, cancel</Button>
  </div>
</Modal>

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
