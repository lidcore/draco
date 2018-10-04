open BsAsyncMonad
open LidcoreBsNode

val get_some : 'a option -> 'a
val partition : int -> 'a array -> 'a array array
val escape : string -> string
val replace_process : string -> unit Callback.t
val delete : Js.Dict.key -> 'a Js.Dict.t -> unit
val printexc : exn -> string

module Json : sig
  val parse : string -> 'a Js.t
  val parse_buf : Buffer.t -> 'a Js.t
  val stringify : 'a -> string
end
