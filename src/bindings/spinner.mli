type t
val init : string -> t
val start : t -> unit
val stop : ?clean:bool -> t -> unit
