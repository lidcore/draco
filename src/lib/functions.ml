open LidcoreBsExpress
open BsAsyncMonad
open BsAsyncMonad.Callback

type fn = Firebase.Functions.t

let running = Firebase.Functions.running

let wrap ~error cb = fun [@bs] err ret ->
  match Js.toOption err with
    | Some (Js.Exn.Error e) ->
        !Config.error_handler e;
        error cb
    | Some exn ->
        let e =
          try
            JsError.make (Printexc.to_string exn)
          with _ -> Obj.magic exn
        in
        !Config.error_handler e;
        error cb
    | None ->
        cb err ret [@bs]

module Http = struct
  type t = Express.t

  type request = Express.request

  let init = Express.init ~useCors:true

  let param req lbl =
    Js.Dict.get (Express.params req) lbl
  let params req = Obj.magic (Express.params req)
  let body req = Obj.magic (Express.body req)
  let query req = Js.Dict.get (Express.query req)

  type response = <
    statusCode: int;
    headers: string Js.Dict.t [@bs.get nullable];
    body: string
  > Js.t

  type handler = request -> response Callback.t

  exception Error of response

  external make_response : statusCode:int -> headers:(string Js.Dict.t Js.Null_undefined.t) -> body:string -> unit -> response = "" [@@bs.obj]

  let make_error ~statusCode body =
    Error (make_response ~statusCode ~headers:Js.Null_undefined.null ~body ())

  let error ~code msg =
    Callback.fail (make_error ~statusCode:code msg)

  let response ?(code=200) ?headers msg =
    let headers =
      match headers with  
        | None -> Js.Null_undefined.null
        | Some h ->
            let headers = Js.Dict.empty () in
            Hashtbl.iter (Js.Dict.set headers) h;
            Js.Null_undefined.return headers
    in
    match Js.Json.stringifyAny msg with
      | Some body ->
          return (make_response ~statusCode:code ~headers ~body ())
      | None ->
          Callback.fail (make_error ~statusCode:500 "Invalid message!")

  let wrap handler cb =
    let error =
      return
        (make_response ~statusCode:500 ~headers:Js.Null_undefined.null ~body:"Internal server error" ())
    in
    let cb = wrap ~error cb in
    let cb = fun [@bs] err ret ->
      match Js.toOption err with
        | Some (Error e) ->
            cb Js.Nullable.null e [@bs]
        | _ ->
            cb err ret [@bs]
    in
    handler cb

  let authenticate req =
    let token =
      if Config.offline then "blabla" else
        Env.get "AUTHENTICATION_TOKEN"
    in
    let error =
      error ~code:401 "Unauthorized"
    in
    match Js.Dict.get (Express.headers req) "authorization" with
      | None -> error
      | Some authorization ->
          let re =
            [%re "/Token token=(.+)/"]
          in
          begin
           match re |> Js.Re.exec authorization with
             | Some t when (Js.Re.captures t).(1) = Js.Nullable.return token ->
                 return ()
             | _ -> error
          end

  let send_response : int -> string Js.Dict.t Js.null_undefined -> string -> Express.response -> unit = [%bs.raw{|function (code, headers, body, resp) {
    var key;
    headers = headers || {};
    for (key in headers)
      resp.append(key, headers[key]);
    resp.status(code).send(body);
  }|}]

  let add_route meth ?(auth=false) app route handler =
    let meth, fn =
      match meth with
        | `Get  -> "GET", Express.get
        | `Post -> "POST", Express.post
        | `Put  -> "PUT", Express.put
    in
    let handler req =
      (if auth then
         authenticate req
       else
         return ()) >> fun _ ->
         handler req
    in  
    let handler req =
      wrap (handler req)
    in
    fn app route (fun req resp ->
      let url = Express.originalUrl req in
      Logger.info {j|Serving $(meth) $(url)|j};
      let cb = fun [@bs] err ret ->
        match Js.toOption err with
          | Some _ -> assert false
          | None -> send_response ret##statusCode ret##headers ret##body resp
      in
      handler req cb)

  let get = add_route `Get
  let post = add_route `Post
  let put = add_route `Put

  let export app =
    Firebase.Functions.Https.from_express app
end

module Event = struct
  type handler = unit Callback.t

  let subscribe topic fn =
    Firebase.Functions.PubSub.on_publish topic (fun [@bs] message _ ->
      let json = Firebase.Functions.PubSub.json message in
      let fn =
        fn json ||> fun exn ->
          Common.requeue ~msg:json topic >> fun () ->
            Callback.fail exn
      in
      to_promise fn)
end
