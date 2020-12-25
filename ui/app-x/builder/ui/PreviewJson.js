import React, { useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import YAML from 'yaml'
import {
  Box,
  Container,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core'
import { default as Editor } from '@monaco-editor/react'

import * as api from 'app-x/api'
import EditorProvider from 'app-x/builder/ui/EditorProvider'
import PreviewProvider from 'app-x/builder/ui/PreviewProvider'
import {
  gen_js,
} from 'app-x/builder/ui/util_tree'

const PreviewJson = (props) => {

  // styles
  const styles = makeStyles((theme) => ({
    editor: {
      width: '100%',
      height: '100%',
    },
  }))()

  // editor context
  const {
    treeData,
    expandedKeys,
    selectedKey,
    treeDirty,
    liveUpdate,
    setLiveUpdate,
  } = useContext(EditorProvider.Context)

  // preview context
  const {
    previewLoading,
    setPreviewLoading,
  } = useContext(PreviewProvider.Context)

  // json content
  const [ json, setJson ] = useState('')

  // load content from api
  useEffect(() => {

    // load from backend if not liveUpdate
    if (!liveUpdate) {
      setPreviewLoading(true)
      // loading url
      const ui_root = globalThis.appx.UI_ROOT
      const url = `/namespace/${props.namespace}/ui_deployment/ui/${props.ui_name}/deployment/${props.ui_deployment}/ui_element/base64:${btoa(props.ui_element_name)}`

      api.get(
        'sys',
        'appx',
        url,
        data => {
          // console.log(data)
          setPreviewLoading(false)
          if (Array.isArray(data)) {
            data = data[0]
          }

          if (!('ui_element_spec' in data) || !('element' in data.ui_element_spec)) {
            setYaml('')
          }

          setJson(JSON.stringify(data.ui_element_spec, null, 2))
        },
        error => {
          setPreviewLoading(false)
          console.error(error)
        })
    }

  }, [liveUpdate])

  // load content from UI context treeData
  useEffect(() => {

    // load from UI context if liveUpdate
    if (liveUpdate) {
      const tree_context = { topLevel: true }
      const { ref, data } = gen_js(tree_context, treeData)
      // set editor value
      setJson(JSON.stringify(data, null, 2))
    }

  }, [liveUpdate, treeData])

  // render
  return (
    <Box
      className={styles.editor}
      onScroll={e => e.stopPropagation()}
      >
      <Editor
        language="json"
        options={{
          readOnly: true,
          wordWrap: 'on',
          wrappingIndent: 'deepIndent',
          scrollBeyondLastLine: false,
          wrappingStrategy: 'advanced',
          minimap: {
            enabled: true
          }
        }}
        value={json}
        >
      </Editor>
    </Box>
  )
}

PreviewJson.propTypes = {
  namespace: PropTypes.string.isRequired,
  ui_name: PropTypes.string.isRequired,
  ui_deployment: PropTypes.string.isRequired,
  ui_element_name: PropTypes.string.isRequired,
}

export default PreviewJson
