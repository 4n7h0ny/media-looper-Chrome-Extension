import GooglePhotos from "@/lib/components/GooglePhotos.svelte";
import * as amplitude from '@amplitude/analytics-browser';
import {mount} from "svelte";
import {googlePhotosProvider} from "@/lib/providers";

export default defineContentScript({
  allFrames: true,
  matches: ["*://photos.google.com/*"],
  main() {
    const appVersion = browser?.runtime?.getManifest()?.version || "0.0.0-dev"

    amplitude.init('a252b7def7525ff7a88e3172423510c0', {
      appVersion,
      autocapture: false
    });

    mount(GooglePhotos, {
      target: document.body,
      props: {provider: googlePhotosProvider}
    })
  }
});
