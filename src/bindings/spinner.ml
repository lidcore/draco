type t

external init : string -> t = "Spinner" [@@bs.new] [@@bs.module "cli-spinner"]
external start : t -> unit = "" [@@bs.send]
external stop : t -> bool Js.Nullable.t -> unit = "" [@@bs.send]
let stop ?clean t =
  stop t (Js.Nullable.fromOption clean)
