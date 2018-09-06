open BsAsyncMonad
open BsAsyncMonad.Callback
open LidcoreBsNode

type params
external params : ?dir:string -> ?prefix:string -> ?postfix:string -> discardDescriptor:bool -> unit -> params = "" [@@bs.obj]

type tmp = <name: string> Js.t

external fileSync : params -> tmp = "" [@@bs.module "tmp"]

external dirSync : params -> tmp = "" [@@bs.module "tmp"]

type t = (string option)*((bool*string) Queue.t)

let init ?dir () =
  dir, Queue.create ()

let update ~dir (_,queue) =
  (Some dir, queue)

let make ?(makeDir=false) ?prefix ?postfix (dir,queue) =
  let params =
    params ?dir ?prefix ?postfix ~discardDescriptor:true ()
  in
  let tmp =
    if makeDir then
      dirSync params
    else
      fileSync params
  in
  let path = tmp##name in
  Queue.push (makeDir,path) queue;
  path

let cleanup (_,queue) =
  Queue.iter (fun (isDir,path) ->
    try
      if isDir then
        Fs.rmdirSync path
      else
        Fs.unlinkSync path
    with _ -> ()) queue

let to_tmp ?prefix ?postfix tmp read cb =
  let tmp = make ?prefix ?postfix tmp in
  let write =
    Fs.createWriteStream ~path:tmp ()
  in
  Stream.pipe read write;
  let errored = ref false in
  let on_error str = Stream.on str (`Error (fun err ->
    if not !errored then
     begin
      errored := true;
      Callback.fail err cb
     end))
  in
  on_error read; on_error write;
  Stream.on write (`Finish (fun _ ->
    if not !errored then
      return tmp cb))
