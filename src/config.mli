(* [true] if [OFFLINE_DEPLOY] is set to ["true"]. *)
val offline : bool

val set_error_handler : (Js.Exn.t -> unit) -> unit

val error_handler : Js.Exn.t -> unit

val maxMessageRetries : int ref
