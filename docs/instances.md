# Instances

Command:

```
draco instances <create|restart|destroy> <instanceA,instanceB,..> -stage <production|staging>
```

Usage: This command is used to deploy the gcloud instances defined by the project. List
of nstances to operate on is optional and defaults to all.

It operators in 3 modes:
* `create`: creates all required pubsub topic, instance group and templates. If any of these already exists,
   it does nothing at the moment so you have to destroy the resource prior to re-creating it to push some changes.
   Internally, this mode calls [Instances.Config.initialize](https://develop.lidcore.com/draco/api/Instances.Config.html)
* `restart`: restarts selected instances.
   Internally, this mode calls [Instances.Config.restart](https://develop.lidcore.com/draco/api/Instances.Config.html)
* `destroy`: destroy.
   Internally, this mode calls [Instances.Config.destroy](https://develop.lidcore.com/draco/api/Instances.Config.html)
