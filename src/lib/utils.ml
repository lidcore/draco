open BsAsyncMonad
open LidcoreBsNode

let get_some = function
  | Some v -> v
  | None -> assert false

let partition size a =
  let len = Array.length a in
  let ret = [||] in
  let pos = ref 0 in
  while !pos < len do
    ignore(Js.Array.push
      (Js.Array.slice ~start:!pos ~end_:(!pos+size) a)
      ret);
    pos := !pos + size;
  done;
  ret

let escape s =
  Printf.sprintf "%S" s

let delete = [%bs.raw fun key obj ->
  "delete obj[key];"
]

let replace_process cmd cb = 
  let stdio = {Child_process.
    stdin  = `Inherit Process.stdin;
    stdout = `Inherit Process.stdout;
    stderr = `Inherit Process.stderr
  } in
  let child =
    Child_process.spawn ~shell:true ~stdio cmd
  in
  let finished = ref false in
  Child_process.on child (`Error (fun exn ->
    finished := true;
    Callback.fail exn cb));
  Child_process.on child (`Exit (fun e ->
    if not !finished then
     begin
      finished := true;
      match e with
        | `Code 0
        | `Signal "SIGTERM" ->
             Callback.return () cb
        | _ -> Callback.fail (Obj.magic e) cb
     end))

external toString : 'a -> string = "" [@@bs.send]

let () =
  Printexc.register_printer (function
  | Js.Exn.Error e -> Some (toString e)
  | _ -> None)

(* This makes sure Utils is loaded and the above is registered. *)
let printexc exn =
  try
    toString exn
  with _ ->
    if Js.Array.isArray exn then
      Printexc.to_string exn
    else
      {j|$(exn)|j}

module Json = struct
  let parse : string -> 'a Js.t = [%bs.raw{|function (x) {
    return JSON.parse(x);
  }|}]

  let parse_buf buf =
    parse (Buffer.toString buf)

  let stringify obj =
    match Js.Json.stringifyAny (Obj.magic obj) with
      | Some v -> v
      | None -> assert false
end
