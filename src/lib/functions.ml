open LidcoreBsExpress
open LidcoreBsNode
open BsAsyncMonad
open BsAsyncMonad.Callback

type fn = Firebase.Functions.t

let running = Firebase.Functions.running

let wrap ~error cb = fun [@bs] err ret ->
  match Js.toOption err with
    | Some (Js.Exn.Error e) ->
        Config.error_handler e;
        error cb
    | Some exn ->
        let e =
          try
            JsError.make (Printexc.to_string exn)
          with _ -> Obj.magic exn
        in
        Config.error_handler e;
        error cb
    | None ->
        cb err ret [@bs]

module Http = struct
  type t = Express.t

  type request = Express.Request.t

  type response_body = [
    | `String of string
    | `Json of Js.Json.t
    | `Stream of Stream.readable
  ]

  type response = {
    code:    int;
    headers: string Js.Dict.t [@bs.optional];
    body:    response_body
  } [@@bs.deriving abstract]

  let init = Express.init ~useCors:true

  let param req lbl =
    Js.Dict.get (Express.Request.params req) lbl
  let params req = Express.Request.params req
  let body req = Obj.magic (Express.Request.body req)
  let query req = Js.Dict.get (Express.Request.query req)

  type handler = request -> response Callback.t

  exception Error of response

  let make_response = response

  let make_error ~code body =
    Error (make_response ~code ~body:(`String body) ())

  let error ~code msg =
    Callback.fail (make_error ~code msg)

  let response ?(code=200) ?headers body =
    let headers =
      match headers with  
        | None -> None
        | Some h ->
            let headers = Js.Dict.empty () in
            Hashtbl.iter (Js.Dict.set headers) h;
            Some headers
    in
    make_response ~code:code ?headers ~body ()

  let wrap handler cb =
    let error =
      return
        (make_response ~code:500 ~body:(`String "Internal server error") ())
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
    match Js.Dict.get (Express.Request.headers req) "authorization" with
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

  let send_response ~ret resp =
    let code = codeGet ret in
    let headers =
      match headersGet ret with
        | Some headers -> headers
        | None -> Js.Dict.empty ()
    in
    let send_string msg =
      ignore(resp |. Express.Response.status code |.
              Express.Response.headers headers |.
              Express.Response.send msg)
    in
    match bodyGet ret with
      | `String string ->
          send_string string
      | `Json json ->
          send_string (Js.Json.stringify json)
      | `Stream stream ->
          Js.Dict.set headers "Transfer-Encoding" "chunked";
          Express.Response.pipe stream resp |.
            Express.Response.writeHead ~headers code

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
      let url = Express.Request.originalUrl req in
      Logger.info {j|Serving $(meth) $(url)|j};
      let cb = fun [@bs] err ret ->
        match Js.toOption err with
          | Some _ -> assert false
          | None -> send_response ~ret resp
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
