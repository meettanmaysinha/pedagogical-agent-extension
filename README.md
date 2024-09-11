# URECA Pedagogical Agent Extension
### Made for Jupyter Lab

## Introduction

This is a Jupyter Lab Extension for the Pedagogical Agent (PA), providing a user interface for a student to interact with the agent. This documentation is your comprehensive guide to understanding the components of this extension.

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

## Developing the Extension
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

Note: There will be 2 icons in the toolbar, the one on the left will be for development, where changes are automatically saved and updated through `jlpm run watch`, while the icon on the right will not be updated, as it is built upon launching of the extension

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
        └── mainContainer.ts    # Displays the Agent in the Window
        └── svg.d.ts            #
        └── tab.ts              # Container inside the mainContainer window
    ├── style                   # Styling CSS files for inteface components
    ├── build.sh                # Docker build file (Not yet implemented - Work in Progress)
    └── run.sh                  # Run script for docker file (Not yet implemented - Work in Progress)


## Citation and References
This extension was developed with reference to [StickyLand](https://github.com/xiaohk/stickyland)

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
For development of the extension, the react components are inside src folder. Files are in TypeScript format and developed through DOM.

To be developed/improved:

#### UI/UX of the chat interface
- Currently the interface is simple, without design/formatting of the texts
  - Markdown could be used to display instead of using TextArea element for the chat

#### Structure of the components
- Currently there are a few layers of components and containers
  - `Agent` < `Content` < `ContentTab` < `mainContainer`
  - It could be cleaner to remove `ContentTab` to reduce the number of layers

#### Docker (Not yet developed)
- Undeveloped docker file
  - Files: *`./run.sh`*,  *`./docker/Dockerfile`*
