open BsAsyncMonad
open LidcoreBsNode

type headers = (string*string) list

type 'a response = <
  statusCode: int;
  data:       'a
> Js.t

val stream : ?failOnClientError:bool -> ?headers:headers -> string -> Stream.readable response Callback.t
val data   : ?failOnClientError:bool -> ?headers:headers -> string -> string response Callback.t
val post   : ?failOnClientError:bool -> ?headers:headers -> ?body:'a Js.t -> string -> Stream.readable response Callback.t
