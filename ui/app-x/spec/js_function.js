import {
  REGEX_VAR,
  classes
} from 'app-x/spec/classes.js'

// type: js/function                                 (~expression)
// params:                                           (:array<:string>)
//   - p1
//   - p2
// body:                     # code block            (:array<:string>|:array<:statement>)
export const js_function = {

  type: 'js/function',
  desc: 'Function',
  children: [
    {
      name: 'params',
      desc: 'Parameters',
      array: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
      ],
      rules: [
        {
          kind: 'pattern',
          data: REGEX_VAR,
          message: 'Must be a valid variable name',
        },
      ],
      _thisNode: {
        types: 'inherit',
        input: 'input/text',
      },
    },
    {
      name: 'body',
      desc: 'Body',
      array: true,
      types: [
        {
          kind: 'class',
          data: 'string'
        },
        {
          kind: 'class',
          data: 'statement'
        },
      ],
      _thisNode: {
        types: [
          {
            kind: 'class',
            data: 'string'
          },
        ],
        input: 'input/statement',
      },
      _childNode: {
        types: [
          {
            kind: 'class',
            data: 'statement'
          },
        ],
      },
    },
  ]
}

export default js_function
