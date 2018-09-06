let () =
  Dotenv.config ()

let stage =
   try
    Sys.getenv "STAGE"
   with Not_found -> "dev"

let release =
  try
    Sys.getenv "RELEASE"
  with Not_found -> "unknown"

let env_get label =
  try
    Some (Sys.getenv label)
  with Not_found -> None

let get ?default label =
  match env_get label, default with
    | Some v, _    
    | None,   Some v -> v
    | None,   None   -> raise Not_found

let get_some ?default label =
  try
    Some (get ?default label)
  with Not_found -> None
