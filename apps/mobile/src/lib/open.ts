import * as WebBrowser from 'expo-web-browser'

/** Open a link to another app of the suite, or to a source, in the in-app browser. */
export function open(url: string) {
  WebBrowser.openBrowserAsync(url).catch(() => {
    // The browser did not open. There is nothing more to do.
  })
}
