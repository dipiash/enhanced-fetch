# enhanced-fetch

## How to view example
Open `/example/index.html` in your browser.

## How to start project for development with example app
1. `npm i`
2. `npm run development`, also you can use a production mode `npm run build`
3. Open `/example/index.html` in your browser for test

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
```
or
```js
import enhancedFetch from 'enhanced-fetch'
```
or
```js
const enhancedFetch = require('enhanced-fetch').default
```
or
```js
const { enhancedFetch } = require('enhanced-fetch')
```
