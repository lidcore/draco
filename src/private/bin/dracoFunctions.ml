open BsAsyncMonad
open BsAsyncMonad.Callback
open LidcoreBsNode
open DracoCommon

let () =
  usage "functions deploy"

external typeof : 'a -> string = "" [@@bs.val]

let deploy () =
  let tmp = Tmp.init () in
  let config = config () in
  let project =
    config##projectId
  in
  (* Make tmp dir *)
  let tmpDir =
    Tmp.make ~makeDir:true tmp
  in

  Logger.info {j|Copying required files, this can take a minute..|j};
  Shell.cp ~options:"-rf"
    {j|$(baseDir)/node_modules|j}
    {j|$(tmpDir)/node_modules|j};

  (* Copy files/dirs. *)
  Array.iter (fun file ->
    if typeof file = "string" then
      Shell.cp ~options:"-rf" file tmpDir
    else
     begin
      let file = Obj.magic file in
      let src = file##source in
      let dst = file##destination in
      Shell.cp ~options:"-rf" src {j|$(tmpDir)/$(dst)|j}
     end) config##functions##files;

  (* Make local copy of bs-platform files *)
  let bsPlatformJson =
    Js.Dict.unsafeGet config##functions "bs-platform.json"
  in
  let bsVersion =
    (Utils.Json.parse_buf
      (Fs.readFileSync {j|$(baseDir)/node_modules/bs-platform/package.json|j}))##version
  in
  Js.Dict.set bsPlatformJson "version" bsVersion;
  Shell.mkdir ~options:"-p" {j|$(tmpDir)/bs-platform/lib/js|j};
  Fs.writeFileSync
    {j|$(tmpDir)/bs-platform/package.json|j}
    (Utils.Json.stringify bsPlatformJson);
  Shell.cp ~options:"-rf"
    {j|$(baseDir)/node_modules/bs-platform/lib/js/*.js|j}
    {j|$(tmpDir)/bs-platform/lib/js|j};

  (* Create package.json *)
  let packageJson =
    Deepmerge.merge
      (Utils.Json.parse_buf
        (Fs.readFileSync {j|$(baseDir)/package.json|j}))
      (Js.Dict.unsafeGet config##functions "package.json")
  in
  Js.Dict.set packageJson##dependencies "bs-platform" "./bs-platform";
  Fs.writeFileSync {j|$(tmpDir)/package.json|j}
    (Utils.Json.stringify packageJson);

  (* Add package-lock.json and run npm install *)
  Shell.cp {j|$(baseDir)/package-lock.json|j} {j|$(tmpDir)/package-lock.json|j};

  Logger.info {j|Running npm install|j};
  Shell.exec {j|cd $(tmpDir) && npm install|j};

  (* Add DRACO_FIREBASE env var *)
  Shell.exec {j|echo 'DRACO_FIREBASE="true"' >> $(tmpDir)/.env|j};

  let firebase =
    {j|$(baseDir)/node_modules/.bin/firebase|j}
  in

  (* Deploy! *)
  Logger.info {j|Deploying..|j};
  let group =
    config##functions##group
  in
  let cmd =
    {j|cd $(tmpDir) && $(firebase) deploy --only functions:$(group) --project $(project)|j}
  in
  Callback.finish
    ((Utils.replace_process cmd) |&> fun () ->
        Tmp.cleanup tmp)

let () =
  if argc < 3 then die ();
  if argv.(2) <> "deploy" then die ();
  deploy()
