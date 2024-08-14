

import products from '../../../../packages/commerce-generic/src/data/products.json'
import slugify from 'slugify'
import _ from 'lodash'

export const cmsNavLinks = _.uniq(products.map(p=>p.category)).map(category => ({name: category, slug: slugify(category)}))

export const cmsFooterLinks = {
  title: 'footerLinks',
  items: [
    {
      label: 'About',
      variant: 'light',
      children: [
        {
          label: 'About Us',
          href: '/',
          variant: 'light',
        },
        {
          label: 'Store Finder',
          href: '/',
          variant: 'light',
        },
        {
          label: 'Careers',
          href: '/',
          variant: 'light',
        },
      ],
    },
    {
      label: 'Customer Support',
      variant: 'light',
      children: [
        {
          label: 'Shipping & Returns',
          href: '/',
        },
        {
          label: 'Customer FAQs',
          href: '/',
        },
      ],
    },
    {
      label: 'Contact Us',
      variant: 'light',
      children: [
        {
          label: '1-800-917-6736',
          href: 'tel:18009176736',
        },
        {
          label: 'contact@email.com',
          href: 'mailto:contact@email.com',
        },
      ],
    },
  ],
}
