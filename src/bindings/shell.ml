external cp : string -> string -> unit = "" [@@bs.module "shelljs"]
external cpOpts : string -> string -> string -> unit = "cp" [@@bs.module "shelljs"]
let cp ?options src dst =
  match options with
    | None -> cp src dst
    | Some opts -> cpOpts opts src dst

external echo : string -> unit = "" [@@bs.module "shelljs"]
external exec : string -> unit = "" [@@bs.module "shelljs"]

external ln : string -> string -> unit = "" [@@bs.module "shelljs"]
external lnOpts : string -> string -> string -> unit = "ln" [@@bs.module "shelljs"]
let ln ?options src dst =
  match options with
    | None -> ln src dst
    | Some opts -> lnOpts opts src dst

external ls : string -> string array = "" [@@bs.module "shelljs"]
external lsOpts : string -> string -> string array = "ls" [@@bs.module "shelljs"]
let ls ?options dir =
  match options with
    | None -> ls dir
    | Some opts -> lsOpts opts dir

external mkdir : string -> unit = "" [@@bs.module "shelljs"]
external mkdirOpts : string -> string -> unit = "mkdir" [@@bs.module "shelljs"]
let mkdir ?options dir =
  match options with
    | None -> mkdir dir
    | Some opts -> mkdirOpts opts dir
