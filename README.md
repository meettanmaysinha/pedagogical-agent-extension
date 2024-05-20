# URECA Pedagogical Agent Extension
### Made for Jupyter Lab


## Prerequisites

* JupyterLab < `4.0`
* NodeJS

> **Note:**
> Only supports `JupyterLab < 4` due to compatability issues


## Installation

`jlpm` is JupyterLab's version of
[yarn](https://yarnpkg.com/). Alternatively,
`yarn` or `npm` can be used interchangeably.

1. In the main directory, run the following command
```bash
pip install -e .
```
2. Link your development version of the extension with JupyterLab
```bash
jupyter labextension develop . --overwrite
```
3. Rebuild extension Typescript source after making changes
```bash
jlpm run build
```

## Running the Extension
Run the following 2 commands in **different** terminals
```bash
# Run the extension in one terminal
jlpm run watch
```

```bash
# Run JupyterLab in a separate terminal
jupyter lab
```
Changes to extension will be automatically saved. Refresh JupyterLab to apply changes.

## License

The software is available under the [BSD-3-Clause License](https://github.com/xiaohk/stickyland/blob/master/LICENSE).
