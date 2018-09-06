open BsAsyncMonad

(* Requeue a pubsub message. Might need to go somewhere else. *)
val requeue : msg:'a -> string -> unit Callback.t
