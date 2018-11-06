.PHONY: api-doc

api_doc_files        := $(filter-out src/private/%, $(wildcard src/*/*.mli))
api_doc_dirs         := $(sort $(dir $(api_doc_files)))
api_include_dirs     := \
	node_modules/bs-platform/lib/ocaml node_modules/bs-async-monad/lib/ocaml \
	node_modules/@lidcore/bs-node/lib/ocaml node_modules/@lidcore/bs-express/lib/ocaml

api-doc: $(api_doc_files)
	rm -rf docs/api/*
	ocamldoc -html -d docs/api -sort $(api_include_dirs:%=-I %) $(api_doc_dirs:%=-I %) $^
