export t=.
export args
export version

lint:
	npx eslint --fix $(args) projects/$(t)

test:
	ng test

check: lint test

build:
	ng build ngx-minithings

release: build
	cd dist/ngx-minithings && yarn publish --access public && cd ../../ && git add . && git commit -m "$(version)" && git tag "$(version)" && git push && git push --tags

pack: build
	cd dist/ngx-minithings && yarn pack && mv slimebones-ngx-minithings-v*.tgz ../

pack.move: pack
	mv dist/slimebones-ngx-minithings-v*.tgz $(t)
