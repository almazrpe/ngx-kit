export t=.
export args
export version

lint:
	cd ../../ && npx eslint --fix $(args) projects/ngx-kit/src/$(t)

test:
	ng test

check: lint test

build:
	ng build

release: build
	cd dist/ngx-kit && yarn publish --access public && cd ../../ && git add . && git commit -m "$(version)" && git tag "$(version)" && git push && git push --tags
