open LidcoreBsNode

type group = Functions.fn Js.Dict.t

external __dirname : string = "" [@@bs.val]

external require : string -> Functions.fn Js.Dict.t = "" [@@bs.val]

external exports : group Js.Dict.t = "" [@@bs.val] [@@bs.scope "module"]

let functionsDir =
  {j|$(__dirname)/../../../../src/functions|j}

let group = Js.Dict.empty ()

let () =
  let config =
    DracoCommon.config ()
  in
  if Fs.existsSync functionsDir then
    Array.iter (fun file ->
      Array.iter (fun (lbl,fn) ->
        Js.Dict.set group lbl fn)
          (Js.Dict.entries (require file)))
            (Shell.ls {j|$(functionsDir)/*.js|j});
  Js.Dict.set exports config##functions##group group
