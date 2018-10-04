open LidcoreBsNode
open BsAsyncMonad
open BsAsyncMonad.Callback

type agent_options = < keepAlive: bool > Js.t

type agent

external make_http_agent : agent_options -> agent = "Agent"
  [@@bs.module "http"] [@@bs.new]

external make_https_agent : agent_options -> agent = "Agent"
  [@@bs.module "https"] [@@bs.new]

let http_agent = make_http_agent [%bs.obj {keepAlive= true}]

let https_agent = make_https_agent [%bs.obj {keepAlive= true}]

type headers = (string * string) list

type 'a response = < statusCode: int ; data: 'a > Js.t

type get

external get : get = "simple-get" [@@bs.module]

type _headers

external make_headers : unit -> _headers = "" [@@bs.obj]

let make_headers l =
  let headers = make_headers () in
  let add_header : (_headers -> string -> string -> unit[@bs]) =
    [%bs.raw {|function(obj,lbl,value) {
      obj[lbl] = value;
    }|}]
  in
  let add_header (lbl, value) = (add_header headers lbl value [@bs]) in
  List.iter add_header l ; headers

type opts

external make_opts :
     ?body:string
  -> ?headers:_headers
  -> ?agent:agent
  -> url:string
  -> unit
  -> opts
  = ""
  [@@bs.obj]

let make_opts ?body ?headers url =
  let agent =
    match Array.to_list (Js.String.split ":" url) with
    | "http" :: _ -> Some http_agent
    | "https" :: _ -> Some https_agent
    | _ -> None
  in
  make_opts ?body ?headers ?agent ~url ()

external statusCode : Stream.readable -> int = "" [@@bs.get]

let is_failed code = code < 200 || code > 299

external make_error : string -> exn = "Error" [@@bs.new]

let error_resp resp =
  let code = resp##statusCode in
  Stream.read resp##data
  >> fun data ->
  Callback.fail
    (make_error {j|Error while processing request: $(code) - $(data)|j})

let make_resp ?(failOnClientError = true) stream =
  let resp = [%bs.obj {statusCode= statusCode stream; data= stream}] in
  if failOnClientError && is_failed resp##statusCode then error_resp resp
  else return resp

external stream : get -> opts -> Stream.readable Callback.callback -> unit = ""
  [@@bs.send "get"]

let stream ?headers url cb =
  let headers =
    match headers with Some l -> Some (make_headers l) | None -> None
  in
  stream get (make_opts ?headers url) cb

let stream ?failOnClientError ?headers url =
  stream ?headers url >> make_resp ?failOnClientError

let data ?failOnClientError ?headers url =
  stream ?failOnClientError ?headers url
  >> fun resp ->
  Stream.read resp##data
  >> fun data -> return [%bs.obj {statusCode= resp##statusCode; data}]

let to_tmp ?failOnClientError ?headers ?prefix ?postfix ~tmp url =
  stream ?failOnClientError ?headers url
  >> fun resp ->
  Tmp.to_tmp ?prefix ?postfix tmp resp##data
  >> fun tmp -> return [%bs.obj {statusCode= resp##statusCode; data= tmp}]

external post : get -> opts -> Stream.readable Callback.callback -> unit = ""
  [@@bs.send]

let post ?(headers = []) ?body url =
  let json_opts body =
    match Js.Json.stringifyAny body with
    | None -> Callback.fail (make_error "Invalid body!")
    | Some body ->
        let headers =
          make_headers (("Content-Type", "application/json") :: headers)
        in
        return (make_opts ~body ~headers url)
  in
  ( match body with
  | Some body -> json_opts body
  | None -> return (make_opts url) )
  >> fun opts -> post get opts

let post ?failOnClientError ?headers ?body url =
  post ?headers ?body url >> make_resp ?failOnClientError
