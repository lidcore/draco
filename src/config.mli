(* [true] if [OFFLINE_DEPLOY] is set to ["true"]. *)
val offline : bool

val set_error_handler : (exn -> unit) -> unit

val error_handler : exn -> unit

val maxMessageRetries : int ref
