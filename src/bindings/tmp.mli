(** Binding for the [tmp] module. *)

open BsAsyncMonad
open LidcoreBsNode
type t
val init : ?dir:string -> unit -> t
(* Update dir. Created files are shared (and cleaned)
 * by both old and new handler. *)
val update : dir:string -> t -> t 
val make : ?makeDir:bool -> ?prefix:string -> ?postfix:string -> t -> string
val cleanup : t -> unit
val to_tmp : ?prefix:string -> ?postfix:string -> t -> Stream.readable -> string Callback.t
