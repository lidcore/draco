let offline =
  try
    Sys.getenv "OFFLINE_DEPLOY" = "true"
  with Not_found -> false

let error_handler = ref (fun _ -> ())

let maxMessageRetries = ref 10
