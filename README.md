# Minithings Angular

Small utilities for Angular Framework.

## Installation

Currently pack installations are supported:
```sh
make pack  # creates a tgz tarball in ./dist directory

# at your project
yarn add file:path/to/generated/pack
```

In order to import styles, you need to import stylesheet `main.css` into
your global css:
```css
// your-project/main.css
@import "~ngx-minithings/src/assets/main.css";
```

> ⚠️ In order to import other assets, you need to copy-paste them into your
> app's `assets/ngx-minithings` directory.
