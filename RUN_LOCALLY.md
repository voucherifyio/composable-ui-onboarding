# Run Composable locally

If you don't want to use the deployment option via Vercel, you can also run Composable UI locally.
Below are the steps on how to do this.

## Pre-Requisites

Ensure that you have installed the following on the local development machine:

-  Node.js v18.14.0 or higher. For checking the current version of Node.js on your machine, run the following command:

   ```shell
   node -v
   ```

   For changing the Node.js version, follow the instructions in the [nvm documentation](https://github.com/nvm-sh/nvm).

-  pnpm v8.0 or higher. For checking the current version of pnpm on your machine, run the following command:

   ```shell
   pnpm --version
   ```

   For installing pnpm, run the following command:

   ```shell
   npm install -g pnpm
   ```

   If you currently have a version prior to 8.0, run the following command:

   ```shell
   npm uninstall pnpm -g
   npm install -g pnpm
   ```

-  A code editor, such as [Visual Studio Code](https://code.visualstudio.com/).

## Installing and configuring Composable UI

#### 1. Clone the [source repository](https://github.com/voucherifyio/composable-ui-onboarding) to your local development environment.
```
git clone https://github.com/voucherifyio/composable-ui-onboarding
```

#### 2. Create and configure your Algolia account.
Below are the steps:

- Sign up for a free Algolia account here: https://www.algolia.com/ and log into your account.
- On the Get Started page, create your first index with a desired name.
- Retrieve your Algolia API keys by following these steps:
- Go to Settings > Team and Access > API Keys and make a note of the following values:
    - Application ID (`NEXT_PUBLIC_ALGOLIA_APP_ID`)
    - Search API Key (`NEXT_PUBLIC_ALGOLIA_API_SEARCH_KEY`)
    - Admin API Key (`ALGOLIA_API_ADMIN_KEY`)
  
#### 3. Create `.env` file in: `scripts` directory.
- It should contain following environment variables:
```
NEXT_PUBLIC_ALGOLIA_APP_ID=
ALGOLIA_API_ADMIN_KEY=
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=products

VOUCHERIFY_API_URL=
VOUCHERIFY_APPLICATION_ID=
VOUCHERIFY_SECRET_KEY=
```

#### 4. Now you have everything to fill in the values of the environment variables.

- `NEXT_PUBLIC_ALGOLIA_APP_ID` will be the obtained `Application ID`, and `ALGOLIA_API_ADMIN_KEY` will be the obtained `Admin API Key`.

#### 5. Get Voucherify credentials.

- Go to `Project Settings` in the Voucherify dashboard
    - Click on your name in the upper right corner.
    - From the list, select `Project Settings`.
    - Find the section with `Application Keys`.
    - Copy or make a note of the `Application ID` and `Secret Key`.
    - Make a note of your [API endpoint](https://docs.voucherify.io/docs/api-endpoints).

      | Shared Cluster   | Endpoint                        |
          |------------------|---------------------------------|
      | Europe (default) | `https://api.voucherify.io`     |
      | United States    | `https://us1.api.voucherify.io` |
      | Asia (Singapore) | `https://as1.api.voucherify.io` |

#### 6. After completing the .env file, run in the `scripts` directory the following commands.
They will make it possible to populate Algolia and Voucherify with the relevant product data.
```
pnpm i
```
```
pnpm run algolia-setup
```
```
pnpm run voucherify-preconfigure
 ```

#### 7. When the installation is finished, create the `.env` in `composable-ui` directory.
- Below are the variables that need to be completed for the application to work properly:
```
NEXT_PUBLIC_ALGOLIA_APP_ID=
NEXT_PUBLIC_ALGOLIA_API_SEARCH_KEY=
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=products

VOUCHERIFY_API_URL=
VOUCHERIFY_APPLICATION_ID=
VOUCHERIFY_SECRET_KEY=
```

You already have all the values you need to complete these variables, so just fill them in again.

#### 8. Run the application.
After running the scripts and completing the environment variables, you should be able to run the `pnpm dev` command from the root directory, the application will be available at `localhost:3000` by default.

## Troubleshooting

If you encounter problems, such as the lack of Algolia configuration, or the lack of authorization of Voucherify keys, please make sure twice that all environment variables are correct. Pay special attention to the correctness of your Voucherify API endpoint.

Most often it also helps to re-run the scripts `pnpm run algolia-setup` and `pnpm run voucherify-preconfigure`.

If there is still a problem with the operation of the application, please [contact us](https://www.voucherify.io/contact-support).
