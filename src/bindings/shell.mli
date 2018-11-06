(** Binding for the [shelljs] module. *)

val cp    : ?options:string -> string -> string -> unit
val echo  : string -> unit
val exec  : string -> unit
val ln    : ?options:string -> string -> string -> unit
val ls    : ?options:string -> string -> string array
val mkdir : ?options:string -> string -> unit 
