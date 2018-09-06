open LidcoreBsExpress
open LidcoreBsNode

module Functions = struct
  type t

  let loadFunctions : unit -> unit [@bs] = [%raw fun () ->
    "require(\"firebase-functions\")"
  ]

  let initApp : unit -> unit [@bs] = [%raw fun () ->
    "require(\"firebase-admin\").initializeApp()"
  ]

  let running =
    match Env.get_some "DRACO_FIREBASE" with
      | None   -> false
      | Some _ -> true

  let () =
    if running then
     begin
      loadFunctions () [@bs];
      initApp () [@bs]
     end

  module Https = struct
    type https
    let https : unit -> https [@bs] = [%raw fun () ->
      "return require(\"firebase-functions\").https"
    ]

    external onRequest : https -> Express.t -> t = "" [@@bs.send]
    let from_express app =
      onRequest (https () [@bs]) app
  end

  module PubSub = struct
    type pubsub
    let pubsub : unit -> pubsub [@bs] = [%raw fun () ->
      "return require(\"firebase-functions\").pubsub"
    ]

    type topic
    external topic : pubsub -> string -> topic = "" [@@bs.send]

    type message
    type context
    external onPublish : topic -> (message -> context -> unit Js.Promise.t [@bs]) -> t = "" [@@bs.send]

    let on_publish name handler =
      onPublish (topic (pubsub () [@bs]) name) handler

    external data : message -> string = "" [@@bs.get]
    let json message =
      let payload =
        Buffer.toString (Buffer.from ~encoding:"base64"
          (data message))
      in
      Utils.Json.parse payload 
  end
end
