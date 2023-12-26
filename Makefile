export t=.
export args
export version

lint:
	npx eslint --fix $(args) projects/$(t)

test:
	ng test

check: lint test

build:
	ng build ngx-kit

release: build
	cd dist/ngx-kit && yarn publish --access public && cd ../../ && git add . && git commit -m "$(version)" && git tag "$(version)" && git push && git push --tags

pack: build
	cd dist/ngx-kit && yarn pack && mv almazrpe-ngx-kit-v*.tgz ../

pack.move: pack
	mv dist/almazrpe-ngx-kit-v*.tgz $(t)
