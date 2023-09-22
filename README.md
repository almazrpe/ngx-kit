# Minithings Angular

Small utilities for Angular Framework.

## Installation

Currently pack installations are supported:
```sh
make pack  # creates a tgz tarball in ./dist directory

# at your project
yarn add file:path/to/generated/pack
```

In order to activate styles, you need to import stylesheet `tailwind.css` into
your global css:
```css
// your-project/main.css
@import "node_modules/ngx-minithings/src/assets/tailwind.css";
```
