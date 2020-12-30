// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const ProviderSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M181.2 929H89.8C62.3 929 40 906.7 40 879.3V527.8c0-27.4 22.3-49.7 49.7-49.7h91.5c27.4 0 49.7 22.3 49.7 49.7v351.5c0.1 27.4-22.2 49.7-49.7 49.7zM90 879h91V528H90v351zM622 881.1c-23.6 0-40.5-1.3-45.3-1.7h-275c-28.9 0-52.4-23.5-52.4-52.4V581.6c0-28.9 23.5-52.4 52.4-52.4h306.2c21.1 0 41.5 6.3 58.9 18.2 17.4 11.9 30.7 28.7 38.3 48.3l13.9 35.7 79-96c13.1-16 31.5-27.1 51.7-31.4 20.2-4.3 41.6-1.6 60 7.7l23.5 11.7c24.2 12.1 41.7 34.1 48.1 60.4 6.4 26.3 0.8 53.9-15.2 75.7L869.7 791c-17.8 26.2-45.1 47.1-81 62.1-27.4 11.4-60 19.4-96.9 23.8-25.8 3.3-50.1 4.2-69.8 4.2zM301.7 579.2c-1.3 0-2.4 1.1-2.4 2.4V827c0 1.3 1.1 2.4 2.4 2.4h277.4l1.2 0.1c0.5 0 50.2 4.7 106.5-2.2 48.9-6 113.2-22 141.8-64.5l0.6-0.8 96.7-131.9c7.3-9.9 9.8-22.5 6.9-34.4s-10.9-22-21.9-27.5l-23.5-11.7c-17.5-8.7-38.4-4.3-50.8 10.8L706.1 725.9H444.6c-13.8 0-25-11.2-25-25s11.2-25 25-25h237.8l0.1-0.2-24-61.9c-8.2-21.1-28.1-34.7-50.7-34.7H301.7zM809 466.3H382V289.8h427v176.5z m-377-50h327v-76.5H432v76.5z" p-id="59432">
      </path><path d="M809 466.3H637.6V289.8H809v176.5z m-121.4-50H759v-76.5h-71.4v76.5zM809 271.5H382V95h427v176.5z m-377-50h327V145H432v76.5z" p-id="59433"></path>
      <path d="M809 271.5H637.6V95H809v176.5z m-121.4-50H759V145h-71.4v76.5z" p-id="59434"></path>
    </svg>
  )
}

const Provider = (props) => {
  return (
    <Icon component={ProviderSvg} {...props} />
  )
}

export default Provider