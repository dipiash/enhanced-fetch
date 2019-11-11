import Promise from 'promise-polyfill';
import {fetch as fetchPolyfill} from 'whatwg-fetch'
import AbortControllerPolyfill from 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'

if (!window.Promise) {
    window.Promise = Promise;
}

if (!window.fetch || !window.AbortController) {
    window.fetch = fetchPolyfill;
    window.AbortController = AbortControllerPolyfill;
}
