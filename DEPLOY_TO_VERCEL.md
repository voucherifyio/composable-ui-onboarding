# Deploying to Vercel

Composable UI provides the foundation for building modern composable commerce sites. 
Composable UI is an examplary online store where the ability to use the capabilities of Voucherify in practice has been added.

To get the most out of onboarding in Voucherify, the ability to deploy Composable UI to Vercel has been created so that you can use your own Voucherify project within the Composable UI sample store.

## Prerequisites

To properly configure Composable UI, you should first:

### 1. Create and configure your Algolia account
Below are the steps:
- Sign up for a free Algolia account here: https://www.algolia.com/ and log into your account.
- On the Get Started page, create your first index with a desired name.
- Retrieve your Algolia API keys by following these steps:
  - Go to Settings > Team and Access > API Keys and make a note of the following values:
      - Application ID
      - Search API Key
      - Admin API Key

### 2. Generate NEXTAUTH_SECRET needed for deployment

[NEXTAUTH_SECRET](https://next-auth.js.org/configuration/options) is the environment variable used for [JWT](https://jwt.io/introduction) encryption when signing in.
It is required to properly deploy Composable UI in Vercel.
- The easiest way is to generate it in the terminal with the command:
```
openssl rand -base64 32
```

- After generating make a note of it.

### 3. Get Voucherify credentials

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

If you have gone through all the above steps, you are ready to deploy the Composable UI on Vercel.

## Deploy Composable UI to Vercel
Below, there is a button that will redirect you to a page where you can enter the values or credentials you noted down earlier.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvoucherifyio%2Fcomposable-ui-onboarding&root-directory=composable-ui&project-name=composable-ui&repository-name=composable-ui&demo-title=Composable%20UI&demo-description=Open%20Source%20React%20Storefront%20for%20Composable%20Commerce&demo-url=https%3A%2F%2Fstorefront.composable.com%2F&demo-image=https%3A%2F%2Fstorefront.composable.com%2Fimg%2Fdemo_image.png&env=NEXTAUTH_SECRET&envLink=https%3A%2F%2Fnext-auth.js.org%2Fconfiguration%2Foptions%23nextauth_secret&env=NEXT_PUBLIC_ALGOLIA_APP_ID&env=NEXT_PUBLIC_ALGOLIA_API_SEARCH_KEY&env=NEXT_PUBLIC_ALGOLIA_INDEX_NAME&env=ALGOLIA_API_ADMIN_KEY&env=VOUCHERIFY_API_URL&env=VOUCHERIFY_APPLICATION_ID&env=VOUCHERIFY_SECRET_KEY)

Once you are redirected to the Vercel website, you will be asked where you want to create your Git repository, needed for deployment.
- Once you are redirected to the Vercel website, you will be asked to complete a form with the required environment variables.
- Once you have chosen the right location and name for your repository, you can proceed to the `Configure Project` step.
- Here you need to enter the values you previously noted. To make it easier to identify these values, look at the table below.

| Key                                | Value description                                  |
|------------------------------------|----------------------------------------------------|
| NEXTAUTH_SECRET                    | The value you generated and noted in Step 2.       |
| NEXT_PUBLIC_ALGOLIA_APP_ID         | The value of `Application ID` you noted in Step 1. |
| NEXT_PUBLIC_ALGOLIA_API_SEARCH_KEY | The value of `Search API Key` you noted in Step 1. |
| NEXT_PUBLIC_ALGOLIA_INDEX_NAME     | Here you should enter `products` value.            |
| ALGOLIA_API_ADMIN_KEY              | The value of `Admin API Key` you noted in Step 1.  |
| VOUCHERIFY_API_URL                 | Your API Endpoint you noted in Step 3.             |
| VOUCHERIFY_APPLICATION_ID          | The value of `Application ID` you noted in Step 3. |
| VOUCHERIFY_SECRET_KEY              | The value of `Secret Key` you noted in Step 3.     |

- After entering these keys, click `Deploy` in the next step.
- Please be patient, the deployment process will take about 4 minutes.
- After successfully deploying the site, Vercel will redirect you to where you can view it.
  Do a quick performance test by adding some product to your cart. 
- In the cart in the Vouchers section, enter the code `BLCFRDY` and see if you can add it to the cart.

**Note:** 
- If an error occurs during the process, it is likely to be related to incorrectly entered values. In such a situation, please try again with another Git repository.
- If there is a problem unrelated to the keys, you can see the detailed error information in the console and [contact us](https://www.voucherify.io/contact-support). 

## Run and test the application

- After successfully deploying the site, Vercel will redirect you to where you can view it.
  Do a quick performance test by adding some product to your cart.
- In the cart in the Vouchers section, enter the code `BLCFRDY` and see if you can apply it to the cart.
- If you want, you can go to Checkout, enter customer data, choose a payment method: `Pay on Delivery (Offline)` and complete your order. After that you should see the redemptions made in the Redemptions tab in Voucherify dashboard.
- You can add more Promotions and Vouchers in Voucherify, as well as test the action with different products and quantities.

**Note:**
- If there is a problem with the operation of an already-deployed application, please also [contact us](https://www.voucherify.io/contact-support).