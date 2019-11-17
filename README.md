# enhanced-fetch-lib

## How to view example
Open `/example/index.html` in your browser.

## Before start
`npm i`

## How to start project for development with example app
1. `npm run development`, also you can use a production mode `npm run build`
2. Open `/example/index.html` in your browser for test

## How to build project for production
1. `npm run build`

## For usage: you can use script tag, import or require
```js
<script src="dist/index.js"></script>

if (!window['enhancedFetch']) {
    alert('"enhancedFetch" is not defined in window scope');

    return;
}

var { requestByFetch } = window['enhancedFetch'];

var fetchInstance = requestByFetch.createInstance({baseUrl: 'https://poller.jeetiss.now.sh',});
var abortC = fetchInstance.abortController();

fetchInstance.fetch('/post', {
    signal: abortC.signal,
    method: 'POST',
    mode: "cors",
}, 10000,)
    .then(res => res.json())
    .then(res => {
        console.log(res)
    })
    .catch(err => {
        console.log(err)
    });

abortC.abort()
```
or
```js
import enhancedFetch from 'enhanced-fetch-lib'
```
or
```js
const enhancedFetch = require('enhanced-fetch-lib').default
```
or
```js
const { enhancedFetch } = require('enhanced-fetch-lib')
```

## TODO
- [ ] Add unit tests
- [ ] Publish into npm
- [ ] Add CI
- [ ] Add auto generation CHANGELOG and version - https://github.com/conventional-changelog/standard-version
- [ ] Add ESLint rules
- [ ] Add Prettier
- [ ] Add husky and lint-staged
- [ ] Add typings (TS or Flow)
