(** API to get environment variables. *)

(** Returns ["STAGE"] environment variable. Defaults to ["dev"] if not set. *)
val stage   : string

(** Returns ["RELEASE"] environment variable. Defaults to ["unknown"] if not set. *)
val release : string

(** Returns the requested environment variable. Raises [Not_found] if variable is not set and no default was passed. *)
val get : ?default:string -> string -> string

(** Returns the requested environment variable. Returns [None] if variable is not set and no default was passed. *)
val get_some : ?default:string -> string -> string option
