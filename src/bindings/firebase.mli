open LidcoreBsExpress

module Functions : sig
  type t

  val running : bool

  module Https : sig
    val from_express : Express.t -> t
  end

  module PubSub : sig
    type message
    type context
    val on_publish : string -> (message -> context -> unit Js.Promise.t [@bs]) -> t
    val json : message -> 'a Js.t
  end
end
