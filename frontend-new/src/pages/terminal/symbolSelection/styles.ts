import { useTheme, useColorMode } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'
import { CSSObject } from '@emotion/react'

interface OptionState {
  isFocused: boolean
  isSelected: boolean
  isDisabled: boolean
}

interface ProvidedStyle {
  [key: string]: CSSObject | undefined
}

const customStyles = {
  control: (): CSSObject => {
    const theme = useTheme()
    const { colorMode } = useColorMode()
    return {
      backgroundColor: mode(
        theme.colors.grey['50'],
        theme.colors.grey['900'],
      )({ theme, colorMode }),

      borderColor: mode(
        theme.colors.grey['100'],
        theme.colors.grey['600'],
      )({ theme, colorMode }),
    }
  },
  option: (provided: ProvidedStyle, state: OptionState): CSSObject => {
    const theme = useTheme()
    const { colorMode } = useColorMode()
    return {
      color:
        colorMode === 'dark'
          ? theme.colors.grey['25']
          : theme.colors.grey['700'],
      backgroundColor: state.isFocused
        ? colorMode === 'dark'
          ? theme.colors.grey['600']
          : theme.colors.grey['200']
        : state.isSelected
          ? colorMode === 'dark'
            ? theme.colors.grey['700']
            : theme.colors.grey['300']
          : colorMode === 'dark'
            ? theme.colors.grey['900']
            : theme.colors.grey['50'],
      ':active': {
        ...provided[':active'],
        backgroundColor:
          !state.isDisabled &&
          (state.isSelected
            ? colorMode === 'dark'
              ? theme.colors.grey['800']
              : theme.colors.grey['400']
            : colorMode === 'dark'
              ? theme.colors.grey['600']
              : theme.colors.grey['200']),
      },
    }
  },
  singleValue: (): CSSObject => {
    const theme = useTheme()
    const { colorMode } = useColorMode()

    return {
      color:
        colorMode === 'dark'
          ? theme.colors.grey['25']
          : theme.colors.grey['700'],
    }
  },
  multiValue: (): CSSObject => {
    const theme = useTheme()
    const { colorMode } = useColorMode()

    return {
      backgroundColor:
        colorMode === 'dark'
          ? theme.colors.grey['50']
          : theme.colors.grey['400'],
      color:
        colorMode === 'dark'
          ? theme.colors.grey['700']
          : theme.colors.grey['25'],
    }
  },
  multiValueLabel: (): CSSObject => {
    const theme = useTheme()
    const { colorMode } = useColorMode()

    return {
      color:
        colorMode === 'dark'
          ? theme.colors.grey['700']
          : theme.colors.grey['25'],
    }
  },
  clearIndicator: (): CSSObject => {
    const theme = useTheme()
    const { colorMode } = useColorMode()

    return {
      color:
        colorMode === 'dark'
          ? theme.colors.grey['600']
          : theme.colors.grey['100'],
    }
  },
  dropdownIndicator: (): CSSObject => {
    const theme = useTheme()
    const { colorMode } = useColorMode()

    return {
      color:
        colorMode === 'dark'
          ? theme.colors.grey['600']
          : theme.colors.grey['100'],
    }
  },
  indicatorSeparator: (): CSSObject => {
    return {
      display: 'none',
    }
  },
  noOptionsMessage: (): CSSObject => {
    const theme = useTheme()
    const { colorMode } = useColorMode()
    return {
      color:
        colorMode === 'dark'
          ? theme.colors.grey['300']
          : theme.colors.grey['700'],
    }
  },
  menu: (): CSSObject => {
    const theme = useTheme()
    const { colorMode } = useColorMode()
    return {
      backgroundColor:
        colorMode === 'dark'
          ? theme.colors.grey['900']
          : theme.colors.grey['50'],
    }
  },
  placeholder: (): CSSObject => {
    const theme = useTheme()
    const { colorMode } = useColorMode()
    return {
      color:
        colorMode === 'dark'
          ? theme.colors.grey['300']
          : theme.colors.grey['600'],
    }
  },
}

export default customStyles
