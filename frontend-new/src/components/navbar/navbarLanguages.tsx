import React from 'react'

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Image,
} from '@chakra-ui/react'

import { LANGUAGES_OPTIONS } from '../../constants/languages'

type LanguagesOptionsType = typeof LANGUAGES_OPTIONS

const NavbarLanguages: React.FC = () => {
  const selectedLanguage = LANGUAGES_OPTIONS['en' as keyof LanguagesOptionsType]

  const handleLanguageChange = (lng: string) => {
    // change language
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        _hover={{ bg: 'transparent' }}
        _expanded={{ bg: 'transparent' }}
      >
        <Image
          src={selectedLanguage.icon}
          alt={selectedLanguage.name}
          style={{ width: '20px', height: '15px' }}
        />
      </MenuButton>
      <MenuList background="grey.900">
        {Object.keys(LANGUAGES_OPTIONS).map((key) => (
          <MenuItem
            key={LANGUAGES_OPTIONS[key as keyof LanguagesOptionsType].lng}
            _hover={{ bg: 'grey.700' }}
            background="grey.900"
            fontSize="sm"
            onClick={() =>
              handleLanguageChange(
                LANGUAGES_OPTIONS[key as keyof LanguagesOptionsType].lng,
              )
            }
          >
            <Image
              src={LANGUAGES_OPTIONS[key as keyof LanguagesOptionsType].icon}
              alt={LANGUAGES_OPTIONS[key as keyof LanguagesOptionsType].name}
              style={{ width: '20px' }}
              mr={2}
            />
            {LANGUAGES_OPTIONS[key as keyof LanguagesOptionsType].name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}

export default NavbarLanguages
