import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: react/context                               (~expression|~statement)
// name:                     # context name          (:string) - autosuggest import
export const react_context = {

  type: 'react/context',
  desc: 'React Context',
  children: [
    {
      name: 'name',
      desc: 'Context Name',
      required: true,
      types: [
        {
          kind: 'class',
          data: 'string',
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: {
          kind: 'input/text',
          options: 'validation.valid_import_names()',
          optionSelfImportNames: true,
          optionsOnly: true,
        },
        examples: [
          'app-x/builder/ui/NavProvider.Context',
        ],
      },
    },
  ]
}

export default react_context
