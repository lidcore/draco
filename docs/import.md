## Import

A very convenient pattern to use Draco modules is to import them as top-level module in your project.
The `draco import` command does just that:

```
% draco import Utils
Writting src/imports/utils.ml..
Writting src/imports/utils.mli..

% cat src/imports/utils.ml
include LidcoreDraco.Utils

% cat src/imports/utils.mli
include module type of LidcoreDraco.Utils
```

Then you can refer to `Utils` in your code without having to prefix it with `LidcoreDraco`
and also extend the module just like a traditional `import` would do.
