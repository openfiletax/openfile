# Testing in the Direct File Client App

The Direct File client app has many steps for completing a tax return, making manual testing and bug reproduction time-consuming. These tools help streamline the process.

## Dev-Only Control Panel

<img width="673" alt="Screenshot 2025-05-23 at 10 08 03  AM" src="https://github.com/user-attachments/assets/5e098552-bd0d-448c-bde1-6b41d279ac7e" />

Access the control panel at `/df/file/account/` for development settings and data management:

- **Change date** - Set browser date to test deadline-related functionality
- **Data Import Profile** - Modify seeded test data (like date of birth) that can't be changed in the normal tax flow during local development
- **Download Data** - Export fact graph as JSON for attaching to pull requests or bug reports
- **Upload Data** - Import fact graph to quickly navigate to specific application states when testing PRs or reproducing bugs
- **Preview Tax Return** - View backend tax return preview
- **Load Preach UUID** - Load specific Preach configurations

## All Screens

<img width="1279" alt="Screenshot 2025-05-23 at 10 09 05  AM" src="https://github.com/user-attachments/assets/7fd2966f-4627-48d9-b8ad-0b3f2c8bbab8" />

Navigate to `/df/file/all-screens/index.html` to view all application pages in one location.

This page displays every screen in the tax flow and post-submission pages. Use the menu to filter and manipulate the view. Generate a PDF by pressing "p" and using the [Just-One-Page-PDF Chrome extension](https://chromewebstore.google.com/detail/just-one-page-pdf-an-awes/fgbhbfdgdlojklkbhdoilkdlomoilbpl?hl=en&pli=1).

## Flamingo Fact Checker

![418692897-164c00a1-b5ff-4280-b201-3be144dbc2a6](https://github.com/user-attachments/assets/001daa15-19c0-4729-bb08-342d66db9283)

Use the [Flamingo Fact Checker](df-tools/Flamingo-Fact-Checker.md) to monitor specific fact values as you progress through the tax flow.
