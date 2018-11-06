open LidcoreBsNode

[%%bs.raw{|
require('winston-papertrail').Papertrail
|}]

type options = {
  host:      string;
  port:      int;
  hostname:  string;
  logFormat: string -> string -> string
} [@@bs.deriving abstract]

type transport
external papertrail : options -> transport  = "Papertrail" [@@bs.scope "transports"] [@@bs.module "winston"] [@@bs.new]

type logger
external info : logger -> 'a -> unit = "" [@@bs.send]
external error : logger -> 'a -> unit = "" [@@bs.send]

let dummy_logger : logger = [%bs.raw{|
  {info: function () {},
   error: function () {}}
|}]

type logger_options = {
  transports: transport array
} [@@bs.deriving abstract]

external createLogger : logger_options -> logger = "Logger" [@@bs.module "winston"] [@@bs.new]

let setup url =
  let url =
    Url.parse url
  in
  let stage =
    Env.stage
  in
  let hostname =
    if Firebase.Functions.running then
      Env.get "FUNCTION_NAME"
    else
      Os.hostname()
  in
  let system =
    Env.get ~default:"draco" "DRACO_SYSTEM"
  in
  let logFormat level msg =
     {j|[$(hostname)] $(level) $(msg)|j}
  in
  let papertrail =
    papertrail
      (options
        ~host:url##hostname
        ~port:url##port
        ~hostname:{j|$(system)-$(stage)|j}
        ~logFormat:logFormat)
  in
  let logger =
    createLogger
      (logger_options ~transports:[|papertrail|])
  in
  logger

let logger =
  match Firebase.Functions.running, Env.get_some "PAPERTRAIL_URL" with
    | true,_
    |_,None -> dummy_logger
    |_,Some url -> setup url

let info s =
  info logger s

let error s =
  error logger s

