export t=.
export args

lint:
	npx eslint --fix $(args) projects/$(t)

test:
	ng test

check: lint test

build:
	ng build ngx-minithings

publish: build
	cd dist/ngx-minithings && yarn publish --access public

pack: build
	cd dist/ngx-minithings && yarn pack && mv slimebones-ngx-minithings-v*.tgz ../

pack.move: pack
	mv dist/slimebones-ngx-minithings-v*.tgz $(t)
