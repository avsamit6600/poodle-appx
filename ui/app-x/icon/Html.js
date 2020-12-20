// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const HtmlSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M137.6 512l204.8-204.8c12.8-12.8 12.8-32 0-44.8-12.8-12.8-32-12.8-44.8 0L70.4 489.6c-6.4 6.4-9.6 12.8-9.6 22.4 0 9.6 3.2 16 9.6 22.4l227.2 227.2c12.8 12.8 32 12.8 44.8 0 12.8-12.8 12.8-32 0-44.8L137.6 512z m464-339.2c-16-3.2-35.2 6.4-38.4 22.4L396.8 812.8c-3.2 16 6.4 35.2 22.4 38.4 16 3.2 35.2-6.4 38.4-22.4L624 211.2c6.4-16-3.2-35.2-22.4-38.4z m352 316.8L726.4 262.4c-12.8-12.8-32-12.8-44.8 0-12.8 12.8-12.8 32 0 44.8L886.4 512 681.6 716.8c-12.8 12.8-12.8 32 0 44.8 12.8 12.8 32 12.8 44.8 0l227.2-227.2c6.4-6.4 9.6-16 9.6-22.4 0-9.6-3.2-16-9.6-22.4z" fill="#333333" p-id="62811"></path>
    </svg>
  )
}

const Html = (props) => {
  return (
    <Icon component={HtmlSvg} {...props} />
  )
}

export default Html