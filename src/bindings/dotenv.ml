type options = {
  path: string [@bs.optional];
  encoding: string [@bs.optional]
} [@@bs.deriving abstract]

external config : options -> unit = "" [@@bs.module "dotenv"]

let config ?path ?encoding () =
  let options =
    options ?path ?encoding ()
  in
  config options
