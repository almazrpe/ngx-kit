set shell := ["nu", "-c"]

ng := if os_family() == "windows" { "ng.cmd" } else { "ng" }
npx := if os_family() == "windows" { "npx.cmd" } else { "npx" }

# todo: refactor all lib to be completely standalone, now it can be built only
#		from a private repo configuration, i.e. is released only from there
#		as a submodule

lint target="" *flags="":
    cd ../../; {{npx}} eslint --fix {{flags}} projects/ngx-kit/src/{{target}}

test:
    {{ng}} test

check: lint test

build:
	ng build

release: build
	cd ../../dist/ngx-kit && yarn publish --access public && cd ../../projects/ngx-kit && git add . && git commit -m "$(version)" && git tag "$(version)" && git push && git push --tags
