# Minithings Angular

Small utilities for Angular Framework.

## Installation

Currently pack installations are supported:
```sh
# creates a tgz tarball in ./dist directory
make pack

# and installs it at your project
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

Tailwind uses as minimal final generated stylesheet as possible, scanning your
files, but it is possible for some styles to not load correctly, for these
cases we recommend to additionally add this safelist configuration:
```js
module.exports = {
  ...
  safelist: [
    "bg-sky-200",
    "text-sky-800",
    "bg-yellow-200",
    "text-yellow-800",
    "bg-red-200",
    "text-red-800"
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
