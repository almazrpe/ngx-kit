export t=.
export args

lint:
	npx eslint --fix $(args) projects/$(t)

test:
	ng test

check: lint test

pack:
	ng build ngx-minithings && cd dist/ngx-minithings && yarn pack && mv slimebones-ngx-minithings-v*.tgz ../
