open LidcoreBsNode
open DracoCommon

let () =
  usage ~staged:false "import [-prefix ModulePrefix] Module"

let prefix = ref "LidcoreDraco"

let m = ref ""

let opts = [
  "-prefix", Arg.Set_string prefix, "Set prefix"
]

let () =
  if argc < 3 then die ();
  if argv.(1) <> "import" then die ();
  let args =
    Array.sub argv 2 (argc-2)
  in
  ignore(Js.Array.unshift "draco" args);
  Arg.parse_argv ~current:(ref 0) args opts (fun s -> m := s) !usageMsg;
  if !m = "" then
    die ~msg:"No module specified!" ();
  let dir =
    {j|src/imports|j}
  in
  let mfile =
    String.uncapitalize !m
  in
  let m =
    let m = !m in
    let prefix = !prefix in
    if prefix <> "" then
      {j|$(prefix).$(m)|j}
    else
      m
  in
  let ml =
    {j|include $(m)\n|j}
  in
  let mli =
    {j|include module type of $(m)\n|j}
  in
  Shell.mkdir ~options:"-p" dir;
  Logger.info {j|Writting $(dir)/$(mfile).ml..|j};
  Fs.writeFileSync {j|$(dir)/$(mfile).ml|j} ml;
  Logger.info {j|Writting $(dir)/$(mfile).mli..|j};
  Fs.writeFileSync {j|$(dir)/$(mfile).mli|j} mli;
