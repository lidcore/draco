open BsAsyncMonad.Callback
open LidcoreBsNode

let stage =
  ref (Env.get ~default:"staging" "STAGE")

let argc = Array.length Process.argv - 1
let argv = Array.sub Process.argv 1 argc

let () =
  let args = [
    "-stage", Arg.Set_string stage, "Set stage"
  ] in
  try
    Arg.parse_argv Process.argv args (fun _ -> ()) "";
  with
    | _ -> ()

let usageMsg = ref "Usage: draco [mode] [options] [-stage <stage>]"

let usage ?(staged=true) opts =
  let stage =
    if staged then
      "[-stage <stage>]"
    else
      ""
  in
  usageMsg := {j|Usage: draco $(opts) $(stage)|j}

external __dirname : string = "" [@@bs.val]

let baseDir =
  Path.normalize {j|$(__dirname)/../../../../../..|j}

let configPath =
  let stage = !stage in
  {j|$(baseDir)/config/$(stage)/draco.yml|j}

let getPath file =
  Fs.realpathSync {j|$(__dirname)/../../../$(file)|j}

let defaultConfigPath =
  getPath "config.yml"

let configSubs () = [
  [%re "/@module_path@/g"], getPath "";
  [%re "/@stage@/g"], !stage
]

let getConfig path =
  let subs = configSubs () in
  let content =
    Buffer.toString
      (Fs.readFileSync path)
  in
  let content =
    List.fold_left (fun content (regexp,sub) ->
      Js.String.replaceByRe regexp sub content)
        content subs
  in
  Yaml.parse content

let config () =
  Deepmerge.merge (getConfig defaultConfigPath)
                  (getConfig configPath)

let error : 'a -> unit = [%bs.raw fun s ->
  "console.error(s);"
]

let die ?msg () =
  begin
   match msg with
     | Some msg -> error msg
     | None -> ()
  end;
  error !usageMsg;
  Process.exit 1

let () =
  if not (Fs.existsSync configPath) then
    die ~msg:{j|Couldn't find config file $(configPath)|j} ()

let rebuild =
  Utils.replace_process "npm run clean" >> fun () ->
    Utils.replace_process "npm run build"
