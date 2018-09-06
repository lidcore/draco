open BsAsyncMonad

type t
val createClient : string -> t
val on_error : t -> (exn -> unit) -> unit
val setnx : t -> string -> string -> int Callback.t
val expire : t -> string -> float -> unit Callback.t
