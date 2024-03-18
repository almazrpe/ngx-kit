export t=.
export args
export version

# todo: refactor all lib to be completely standalone, now it can be built only
#		from a private repo configuration, i.e. is released only from there
#		as a submodule

lint:
	cd ../../ && npx eslint --fix $(args) projects/ngx-kit/src/$(t)

test:
	ng test

check: lint test

build:
	ng build

release: build
	cd ../../dist/ngx-kit && yarn publish --access public && cd ../../projects/ngx-kit && git add . && git commit -m "$(version)" && git tag "$(version)" && git push && git push --tags
