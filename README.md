# Minithings Angular

Small utilities for Angular Framework.

## Installation

Currently pack installations are supported:
```sh
make pack  # creates a tgz tarball in ./dist directory

# at your project
yarn add file:path/to/generated/pack
```

In order to import styles, you need to install `tailwindcss` and specify
library's content in your `tailwind.config.js`:
```js
module.exports = {
  content: [
    ...
    "./node_modules/slimebones/ngx-minithings/**/*.{html,ts}"
  ]
}
```

> ⚠️ In order to import other assets, you need to copy-paste them into your
> app's `assets/ngx-minithings` directory.

## Contributing

The library itself is located inside `projects/ngx-minithings`. For manual
testing and checking things out, the `projects/testground` is used.

For the invited contributors, each feature is implemented in a separate branch,
then a pull request to `main` is dropped.
