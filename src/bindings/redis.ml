open BsAsyncMonad

type t
external createClient : string -> t = "" [@@bs.module "redis"]

external on : t -> string -> (exn -> unit [@bs]) -> unit = "" [@@bs.send]

let on_error client fn =
  on client "error" (fun [@bs] exn ->
    fn exn)

external setnx : t -> string -> string -> int Callback.callback -> unit = "" [@@bs.send]
external expire : t -> string -> float -> unit Callback.callback -> unit = "" [@@bs.send]
