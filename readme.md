## Fight OCD in your browser!

By solving simple problems you gain trust and confidence in yourself - this should help fighting [Obsessive–compulsive disorder](https://en.wikipedia.org/wiki/Obsessive%E2%80%93compulsive_disorder). 

The main idea is to check how well you remember sequences of numbers and letters - a common task in everyday life, e.g. when filling in documents. OCD makes me recheck phone/passport numbers ridiculous number of times, because of constant doubts. Hope this app will help not only me but also you if you experience something similar 😃

You can try it yourself here: [navalnica.github.io/akr](https://navalnica.github.io/akr/)


## Features to add
The project is in development. You are welcome to help to implement following features!

* translate into Belarusian
* fix layout jitter when opening setting. probably use `display: grid` instead of flexboxes

## Technologies used
* [Svelte](https://svelte.dev) framework - to build reactive interface
* [Vite](https://vitejs.dev/) - to build Svelte app into a static web-site (html + css + js)
* [Pico.css](https://picocss.com/) - for styling, especially for out-of-the-box light/dark theme support in components
* [Github pages](https://pages.github.com/) - to host a static web-site

## Data used
* SWIFT codes are sampled from the following dataset: [github.com/PeterNotenboom/SwiftCodes](https://github.com/PeterNotenboom/SwiftCodes).<br>
  Notebook to reproduce data loading and sampling: [py/swift_codes_parser.ipynb](py/swift_codes_parser.ipynb)
* ISO 3166-1 alpha-2 country codes are taken from [gist.github.com/tadast/8827699](https://gist.github.com/tadast/8827699)

## How to build
* The project was built from the Vite+Svelte template
    * To reproduce run: `npm init vite` and select `Svelte` template
    * There is no need in reproducing, you can use the code from this repo to get started
* Install dependencies: `npm install`.<br>
  This will create `node_modules` folder and `package-lock.json`
* To run dev server: `npm run dev`
    * If you run development in docker container,<br>
      you need to expose port to your host by `npm run dev -- --host`
    * To specify port: `npm run dev -- --port 1234`
* To build static website: `npm run build`. Artifacts will be stored to `docs` folder
    * To change output dir: `npm run build -- --outDir <dirname>`
* To preview built static website: `npm run preview`
    * Similar to above, you can specify outDir, change port or expose host:<br>
      `npm run preview -- --outDir docs --port 4000 --host`
