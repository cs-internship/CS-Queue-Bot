# CS-Queue-Bot

An automated Telegram bot designed to manage the CS Internship Program queue group. It streamlines onboarding, prevents spam, simplifies admin tasks, and integrates seamlessly with Azure DevOps to track candidates and manage group operations efficiently.

![photo_2025-08-05_00-41-50](https://github.com/user-attachments/assets/abba91a6-9b22-42ab-b5c9-1718fbe7ae20)


## Project Overview

**CS-Queue-Bot** is a Node.js-based Telegram bot built to streamline the management of the CS Internship Program's queue group. It automates new member onboarding, enforces anti-spam measures, provides admin tools, and integrates with Azure DevOps to efficiently track candidate progress and activity.

## Features

-   **Automated Onboarding:** Welcomes new members, checks for required usernames, and guides them through the process.
-   **Spam Protection:** Detects and blocks users who send excessive messages in a short period.
-   **Admin Commands:** Includes commands for version checking, user management (ban/unban), and adding users to the Azure DevOps queue.
-   **Azure DevOps Integration:** Automatically creates and links work items for new users in Azure DevOps.
-   **Error Handling & Logging:** Notifies admins of errors and provides links to logs for debugging.
-   **Express Health Check:** Exposes a simple HTTP endpoint for deployment health monitoring.

## Technologies Used

-   **Node.js** — JavaScript runtime for server-side logic
-   **Telegraf** — Modern Telegram Bot Framework for Node.js
-   **Express** — Lightweight web server for health checks and deployment
-   **Axios** — Promise-based HTTP client for API requests (Azure DevOps)
-   **dotenv** — Loads environment variables from `.env` files
-   **Azure DevOps REST API** — For work item and candidate management

## Installation Instructions

### Prerequisites

-   Node.js (v16 or higher recommended)
-   npm (Node package manager)

### Steps

1. **Clone the repository:**
    ```sh
    git clone https://github.com/cs-internship/CS-Queue-Bot.git
    cd CS-Queue-Bot/bot
    ```
2. **Install dependencies:**
    ```sh
    npm install
    ```
3. **Set up environment variables:**
    - Copy `.env.example` to `.env` (create `.env` if not present).
    - Fill in all required variables (see below).
4. **Start the bot:**
    ```sh
    node index.js
    ```

## Configuration and Environment Variables

Create a `.env` file in the `bot/` directory with the following variables:

| Variable           | Description                               |
| ------------------ | ----------------------------------------- |
| TELEGRAM_BOT_TOKEN | Telegram bot token from BotFather         |
| PAT_TOKEN          | Azure DevOps Personal Access Token        |
| Admin_Group_ID     | Telegram group ID for admin notifications |

**Other configuration values** (set in `config.js`):

-   `GROUP_ID`: Main group chat ID
-   `ORGANIZATION`: Azure DevOps organization name
-   `PROJECT`: Azure DevOps project name
-   `PARENT_ID`, `WORKITEM_ID`: Work item IDs for Azure DevOps integration
-   `SPAM_THRESHOLD`, `SPAM_TIME_WINDOW`: Anti-spam settings


## Bot Commands

Below is a complete list of available bot commands, with details on their usage and behavior:

| Command    | Who Can Use             | How to Use                               | Description                                                                                                                                                      |
| ---------- | ----------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/start`   | All users (private)     | Send `/start` in private                 | Shows a welcome message and instructions for registering your Telegram username for session tracking. Pins the message for easy access.                          |
| `/Version` | Admin only              | `/Version`                               | Displays the current bot version. Only the main admin (by username) receives the version; others get an emoji reaction.                                          |
| `/add_ID`  | Admins (in group)       | Reply to a user's message with `/add_ID` | Adds the replied user to the Azure DevOps queue by creating a work item. Only works in the main group and for admins.                                            |
| `/Aloha`   | All users (in group)    | `/Aloha`                                 | Sends a greeting mentioning the user and the main admin. Only works in the main group.                                                                           |
| `/Ban`     | Admins (in admin group) | Reply to a user's message with `/Ban`    | Bans the user whose message is replied to (by user ID in the message). Notifies both the user and the admin group. Only works in the admin group and for admins. |

**Other Bot Behaviors:**

-   **Spam Protection:** If a user sends too many messages in a short time, they are automatically blocked and notified. Admins are alerted with an option to unblock.
-   **New Member Onboarding:** When a new user joins, the bot:
    -   Welcomes them
    -   Checks for a username
    -   Guides them to set a username if missing
    -   Registers them in Azure DevOps if eligible
-   **Unban via Inline Button:** Admins can unblock users via an inline button in the admin group.
-   **Error Handling:** All errors are reported to the admin group with details and log links.

## Folder/File Structure

```
CS-Queue-Bot/
├── LICENSE
├── README.md
├── .gitignore
├── .gitattributes
├── bot/
│   ├── config.js            # Configuration and environment variables
│   ├── index.js             # Main entry point, bot and server startup
│   ├── package.json         # Project metadata and dependencies
│   ├── .env                 # Environment variables (not committed)
│   ├── handlers/            # Telegram event handlers
│   │   ├── callback.js      # Handles inline button callbacks (e.g., unban)
│   │   ├── commands.js      # All bot commands and admin actions
│   │   ├── messages.js      # Private message and spam logic
│   │   ├── newMembers.js    # New member onboarding and checks
│   │   └── startMessage.js  # /start command logic
│   ├── services/
│   │   └── azure.js         # Azure DevOps integration logic
│   └── utils/               # Utility/helper modules
│       ├── adminChecker.js  # Admin check logic
│       ├── cooldown.js      # Command cooldown management
│       ├── error.js         # Error reporting and admin notification
│       ├── spamProtection.js# Spam detection and user tracking
```

## Contribution Guidelines

1. **Fork the repository** and create your branch from `main`.
2. **Follow code style** and best practices used in the project.
3. **Document your changes** in code and update the README if needed.
4. **Open a pull request** with a clear description of your changes.
5. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the [MIT License](./LICENSE).

## Contact / Author Info

- **Author:** [Ali Sadeghi](https://github.com/Ali-Sdg90)
- **Developed for:** [CS Internship Program](https://github.com/cs-internship)

