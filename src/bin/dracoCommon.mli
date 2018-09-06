open BsAsyncMonad

val argc       : int
val argv       : string array
val baseDir    : string
val usage      : ?staged:bool -> string -> unit
val usageMsg   : string ref
val configPath : string
val config     : unit -> 'a Js.t
val die        : ?msg:string -> unit -> 'a
val getPath    : string -> string
val rebuild    : unit Callback.t 
