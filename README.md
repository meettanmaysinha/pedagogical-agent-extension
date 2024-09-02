# URECA Pedagogical Agent Extension
### Made for Jupyter Lab

## Introduction

This is a Jupyter Lab Extension for the Pedagogical Agent, providing a user interface for the student to interact with the agent. This documentation is your comprehensive guide to understanding the components of this extension.

For development, refer to the Development section at the end of this README

## Key Features

Here are some of the key features of the PA Extension:

- **Feature 1**: Chat message input
- **Feature 2**: Drag and drop cells to query


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

## Files

### Main Folders and Classes
    .
    ├── docker                  # Docker file for extension (Not yet implemented - Work in Progress)
    ├── jupyterlab_stickyland   # Extension files
    ├── src                     # Source code for interface components
        └── agent.ts            # Agent components (Chat messages, display inputs/responses)
        └── button.ts           # Button to open/close the chat window
        └── content.ts          # Displays the agent component
        └── icons.ts            # Different icons used for the extension
        └── index.ts            # Collates the different components and displays button on the toolbar
        └── contentContainer.ts       # Displays the Agent in the Window
        └── svg.d.ts            #
        └── tab.ts              # Container for the stickyland window
    ├── style                   # Styling CSS files for inteface components
    ├── build.sh                # Docker build file (Not yet implemented - Work in Progress)
    └── run.sh                  # Run script for docker file (Not yet implemented - Work in Progress)


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


## Development
