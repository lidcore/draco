open LidcoreBsNode

external __dirname : string = "" [@@bs.val]

let instancesDir =
  {j|$(__dirname)/../../../../src/instances|j}

let initDir =
  {j|$(__dirname)/../../../../src/init|j}

let () =
  if Fs.existsSync initDir then
    RequireAll.exec initDir;
  if Fs.existsSync instancesDir then
    RequireAll.exec instancesDir;
  Instances.Runtime.run ()

