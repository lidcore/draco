(* [true] if [OFFLINE_DEPLOY] is set to ["true"]. *)
val offline : bool

val error_handler : (Js.Exn.t -> unit) ref

val maxMessageRetries : int ref
