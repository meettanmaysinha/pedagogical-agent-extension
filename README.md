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

## Citation and References
This extension was modified from [StickyLand](https://github.com/xiaohk/stickyland)

```bibTeX
@inproceedings{wangStickyLandBreakingLinear2022,
  title = {{{StickyLand}}: {{Breaking}} the {{Linear Presentation}} of {{Computational Notebooks}}},
  shorttitle = {{{StickyLand}}},
  booktitle = {Extended {{Abstracts}} of the 2022 {{CHI Conference}} on {{Human Factors}} in {{Computing Systems}}},
  author = {Wang, Zijie J. and Dai, Katie and Edwards, W. Keith},
  year = {2022},
  publisher = {{ACM}}
}
```

## License

The software is available under the [BSD-3-Clause License](https://github.com/xiaohk/stickyland/blob/master/LICENSE).
