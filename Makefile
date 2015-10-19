SRC = $(shell find src -name '*.js')
LIB = $(SRC:src/%.js=lib/%.js)

default: lib

.PHONY: \
	default \
	run-server

node_modules: package.json
	npm install
	touch "$@"

lib: $(LIB)
	touch "$@"

# 'babel -b flow' if we wanted to pass it all through flow as a second step
lib/%.js: src/%.js node_modules
	mkdir -p $(@D)
	node_modules/babel/bin/babel.js --stage=0 $< -o $@

run-server: lib
	node lib/run-server.js
