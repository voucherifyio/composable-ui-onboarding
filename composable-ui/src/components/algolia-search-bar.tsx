import {
  ALGOLIA_API_SEARCH_KEY,
  ALGOLIA_APP_ID,
  ALGOLIA_INDEX_NAME,
} from '../utils/constants'
import React, { useRef, useState } from 'react'
import algoliasearch from 'algoliasearch'
import { useRouter } from 'next/router'
import { AlgoliaProduct } from '@composable/types'
import { Flex, Box, Text, FormControl, Input } from '@chakra-ui/react'
import Image from 'next/image'

const ALGOLIA_KEYS = [
  ALGOLIA_APP_ID,
  ALGOLIA_API_SEARCH_KEY,
  ALGOLIA_INDEX_NAME,
]
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_SEARCH_KEY)

export const AlgoliaSearchbar = () => {
  const algoliaKeysMissing = ALGOLIA_KEYS.some((key) => !key)
  const index = searchClient.initIndex(ALGOLIA_INDEX_NAME)
  const [searchResults, setSearchResults] = useState([])
  const router = useRouter()
  const searchBar = useRef()

  const handleSearch = (e: any) => {
    console.log('searching for: ', e.target.value)
    if (e.target.value.length === 0) setSearchResults(() => [])
    else {
      index
        .search(e.target.value)
        .then(({ hits }: any) => {
          setSearchResults(() => hits)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }

  const handleRedirect = (hit: AlgoliaProduct) => {
    ;(searchBar as any)?.current?.reset?.()
    setSearchResults([])
    router.push(`/product/${hit?.slug}`)
  }

  const ProductDisplay = ({ hit }: any) => {
    return (
      <Flex
        p={2}
        cursor="pointer"
        _hover={{ bg: 'gray.50' }}
        borderRadius="md"
        onClick={() => handleRedirect(hit)}
      >
        <Image
          width={25}
          height={25}
          objectFit="contain"
          src={hit.images?.at?.(0)?.url}
          alt={hit.images?.at?.(0)?.alt || hit.name}
        />
        <Box pl={2}>
          <Text fontWeight="bold" fontSize={{ base: 'lg', lg: 'sm' }}>
            {hit.name}
          </Text>
        </Box>
      </Flex>
    )
  }

  if (algoliaKeysMissing) {
    return null
  }

  return (
    <Box>
      {(searchBar && ( // @ts-ignore
        <FormControl ref={searchBar} className="nosubmit">
          <Input
            className="nosubmit"
            width={{ lg: '250px', xl: '360px' }}
            bg="white"
            type="search"
            placeholder="Find product"
            onChange={handleSearch}
            _focus={{ boxShadow: 'none' }} // Disable the focus box shadow
          />
        </FormControl>
      )) ||
        undefined}

      {searchResults && searchResults.length > 0 && (
        <Box
          width={{ lg: '250px', xl: '360px' }}
          mt={0.5}
          bg="white"
          rounded="md"
          zIndex="40"
          position="absolute"
          boxShadow="md"
        >
          <Box id="autocomplete"></Box>
          {searchResults.map((hit: AlgoliaProduct) => (
            <ProductDisplay key={hit?.slug} hit={hit} />
          ))}
        </Box>
      )}
    </Box>
  )
}
