(** Logging API. *)

val on_info : ('a -> unit) -> unit
val info    : 'a -> unit

val on_error : ('a -> unit) -> unit
val error    : 'a -> unit
