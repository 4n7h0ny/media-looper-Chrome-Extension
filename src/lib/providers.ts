import type {Media} from "@/lib/model";
import {
  extractMediaId as youtubeIdFromUrl,
  sourceIdFromVideoId as youtubeSourceIdFromMediaId,
  videoIdFromSourceId as youtubeMediaIdFromSourceId,
  sourceInfo as youtubeSourceInfo,
  videoChapters as youtubeVideoChapters
} from "@/lib/youtube/ui";

export interface MediaProvider {
  idFromUrl(url: string): string | null;
  sourceIdFromMediaId(id: string): string;
  mediaIdFromSourceId(sourceId: string): string;
  sourceInfo(): Partial<Media> | null;
  videoChapters?(video: HTMLVideoElement | null): {title: string | undefined; time: string}[];
  previousImportKey?(sourceId: string): string | null;
}

export const youtubeProvider: MediaProvider = {
  idFromUrl: youtubeIdFromUrl,
  sourceIdFromMediaId: youtubeSourceIdFromMediaId,
  mediaIdFromSourceId: youtubeMediaIdFromSourceId,
  sourceInfo: youtubeSourceInfo,
  videoChapters: youtubeVideoChapters,
  previousImportKey: (sourceId: string) => `"media-looper:youtube:${youtubeMediaIdFromSourceId(sourceId)}"`
};

function extractGooglePhotosMediaId(url: string) {
  const match = url.match(/\/photo\/([^/?#]+)/);
  return match ? match[1] : null;
}

function googlePhotosSourceInfo() {
  return {title: document.title};
}

function googlePhotosSourceIdFromMediaId(mediaId: string) {
  return `googlephotos:${mediaId}`;
}

function googlePhotosMediaIdFromSourceId(sourceId: string) {
  return sourceId.replace(/^googlephotos:/, "");
}

export const googlePhotosProvider: MediaProvider = {
  idFromUrl: extractGooglePhotosMediaId,
  sourceIdFromMediaId: googlePhotosSourceIdFromMediaId,
  mediaIdFromSourceId: googlePhotosMediaIdFromSourceId,
  sourceInfo: googlePhotosSourceInfo,
  videoChapters: () => [],
};
