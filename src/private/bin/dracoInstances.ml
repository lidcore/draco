open BsAsyncMonad.Callback
open DracoCommon

type operation = [
  | `Create [@bs.as "Creating"]
  | `Restart [@bs.as "Restarting"]
  | `Destroy [@bs.as "Destroying"]
] [@@bs.deriving jsConverter]

let () =
  usage "instances [create|restart|destroy] [instance-group-name1,instance-group-name2,..]"

external __dirname : string = "" [@@bs.val]

let instancesDir =
  {j|$(__dirname)/../../../../../src/instances|j}

(* Require all instances. Will create all required subscriptions. *)
let () =
  if LidcoreBsNode.Fs.existsSync instancesDir then
    RequireAll.exec instancesDir

let () =
  if argc < 3 then die ();
  let operation = 
    match argv.(2) with
      | "create" -> `Create
      | "restart" -> `Restart
      | "destroy" -> `Destroy
      | _ -> die ~msg:"Invalid mode" ()
  in
  let instancesToDeploy = 
    try
      if argv.(3) = "-stage" then [] else
      Array.to_list (Js.String.split "," argv.(3))
    with Invalid_argument "index out of bounds" -> []
  in
  let config = config () in
  let projectId =
    config##projectId
  in
  let serviceAccount =
    config##serviceAccount
  in
  let zone =
    config##zone
  in
  let instances =
    Array.to_list config##instances
  in
  let instances =
    match instancesToDeploy with
      | [] -> instances
      | _ ->
         List.map (fun name ->
           try
             List.find (fun config -> config##name = name) instances
           with
             | Not_found ->
                 die ~msg:{j|No config for instance group $(name) in $(configPath)|j} ()) instancesToDeploy
  in
  let fn config =
    match operation with
      | `Create ->
          Instances.Config.initialize ~projectId ~serviceAccount ~zone
                                      ~instanceTemplate:config##instanceTemplate
                                      ~autoscaler:config##autoscaler
                                      config##name
      | `Restart ->
          Instances.Config.restart ~projectId ~zone config##name
      | `Destroy ->
          Instances.Config.destroy ~projectId ~zone config##name
  in
  let operation =
    operationToJs operation
  in
  let setups () = seq
    (List.map (fun config ->
      let name = config##name in
      let spinner =
        Spinner.init {j|$(operation) $(name) (project: $(projectId)).. %s|j}
      in
      Spinner.start spinner;
      fn config &> fun () ->
        Spinner.stop ~clean:true spinner;
        Printf.printf "%s %s (project: %s).. done!\n" operation name projectId;
        return ()) instances)
  in
  finish (Instances.Runtime.setup () >> setups)
