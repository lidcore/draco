# Image

Command:

```
draco image <base|app|world> -stage <production|staging>
```

Usage: This command is used to build the image for all gcloud instances defined in the project. It operates in 3 modes:
* `base`: base image is intended for all things that do not need to be updated for each deploy, for instance base package dependencies
* `app`: app image is the final image that will be used by the instances running on gcloud
* `world`: world rebuilds for base and app image into a single, merged app image
