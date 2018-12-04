let offline =
  try
    Sys.getenv "OFFLINE_DEPLOY" = "true"
  with Not_found -> false

let error_handler = ref (fun exn ->
  Logger.error {j|Error: $(exn)|j})

let set_error_handler fn =
  error_handler := (fun exn ->
    Logger.error {j|Error: $(exn)|j};
    fn exn)

let error_handler exn = !error_handler exn

let maxMessageRetries = ref 10
