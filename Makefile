export t=.
export args

lint:
	npx eslint --fix $(args) projects/$(t)

test:
	ng test

check: lint test
