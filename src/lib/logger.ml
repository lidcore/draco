let handlers = Js.Dict.empty ()

let on_info fn =
  Js.Dict.set handlers "info" (Obj.magic fn)

let on_error fn =
  Js.Dict.set handlers "error" (Obj.magic fn)

let info s =
  Js.log s;
  Winston.info s;
  match Js.Dict.get handlers "info" with
    | Some fn ->
        let fn : 'a -> unit = Obj.magic fn in
        fn s
    | None -> ()

let error_log : 'a -> unit [@bs] = [%bs.raw fun m ->
  "console.error(m);"
]

let error s =
  error_log (Obj.magic s) [@bs];
  Winston.error s;
  match Js.Dict.get handlers "error" with
    | Some fn ->
        let fn : 'a -> unit = Obj.magic fn in
        fn s
    | None -> ()

let () =
  if Env.stage = "production" then
    LidcoreBsNode.Process.on (`UncaughtException (fun exn ->
      error (Obj.magic exn);
      raise exn))
