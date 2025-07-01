from datetime import datetime

project = "OpenFile"
copyright = f"{datetime.now().year}, OpenFile"
author = "OpenFile"

extensions = [
    "sphinx_design",
]

html_theme = "furo"
html_theme_options = {
    "source_repository": "https://github.com/openfiletax/openfile/",
    "source_branch": "openfile",
    "source_directory": "docs/source/",
    "light_css_variables": {
        "color-content-foreground": "#212121",
        "color-background-primary": "#ffffff",
        "color-background-border": "#ffffff",
        "color-sidebar-background": "#ffffff",
        "color-brand-content": "#0071bc",
        "color-brand-primary": "#0071bc",
        "color-link": "#0071bc",
        "color-link--hover": "#205493",
        "color-inline-code-background": "#f6f6f6;",
        "color-foreground-secondary": "#000",
    },
    "light_css_variables": {
        "color-content-foreground": "#ffffff",
        "color-background-primary": "#212121",
        "color-background-border": "#212121",
        "color-sidebar-background": "#212121",
        "color-brand-content": "#0071bc",
        "color-brand-primary": "#0071bc",
        "color-link": "#0071bc",
        "color-link--hover": "#205493",
        "color-inline-code-background": "#f6f6f6;",
        "color-foreground-secondary": "#000",
    },
}
html_title = f"OpenFile"