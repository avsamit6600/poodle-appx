import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  FormControl,
  InputLabel,
  FormGroup,
  FormControlLabel,
  FormHelperText,
  TextField,
  Switch,
  makeStyles
} from '@material-ui/core'
import {
  DeleteOutlineOutlined,
} from '@material-ui/icons'
import {
  default as NestedMenuItem
} from 'material-ui-nested-menu-item'
import {
  Tree,
} from 'antd'
import {
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons'
const { DirectoryTree } = Tree
import {
  Icon,
} from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import {
  useForm,
  useFormContext,
  useFieldArray,
  FormProvider,
  Controller,
} from "react-hook-form";
import { parse, parseExpression } from "@babel/parser"

import * as api from 'app-x/api'
import ReactIcon from 'app-x/icon/React'
import TextFieldArray from 'app-x/component/TextFieldArray'
import EditorProvider from 'app-x/builder/ui/EditorProvider'
import AutoCompleteHtmlTag from 'app-x/builder/ui/AutoCompleteHtmlTag'
import AutoCompleteImportName from 'app-x/builder/ui/AutoCompleteImportName'
import {
  parse_js,
  lookup_icon_for_type,
  lookup_title_for_input,
  valid_import_names,
  valid_html_tags,
} from 'app-x/builder/ui/util_parse'
import {
  tree_traverse,
  tree_lookup,
  lookup_child_by_ref
} from 'app-x/builder/ui/util_tree'

// add dialog
const SyntaxAddDialog = (props) => {

  // styles
  const styles = makeStyles((theme) => ({
    dialog: {
      minWidth: 460,
      [theme.breakpoints.up('md')]: {
        minWidth: 600,
      },
    },
    dialogContent: {
      padding: theme.spacing(0, 5, 3),
    },
    formControl: {
      width: '100%',
      // margin: theme.spacing(1),
      padding: theme.spacing(2, 0),
    },
  }))()

  const {
    treeData,
    selectedKey,
  } = useContext(EditorProvider.Context)

  // states and effects
  const [ parentNode,       setParentNode     ] = useState(null)
  const [ nodeType,         setNodeType       ] = useState(props.addNodeType)
  const [ isSwitchDefault,  setSwitchDefault  ] = useState(props.isSwitchDefault)

  // parentNode
  useEffect(() => {
    // lookup node
    const lookupNode = tree_lookup(treeData, selectedKey)
    setParentNode(lookupNode)
    // console.log(lookupNode)
    // console.log(lookupNode?.children.filter(child => child.data?.__ref === null))
    // console.log(parentNode)
  }, [selectedKey])

  // nodeType
  useEffect(() => {
    setNodeType(props.addNodeType)
  }, [props.addNodeType])

  // isSwitchDefault
  useEffect(() => {
    setSwitchDefault(props.isSwitchDefault)
  }, [props.isSwitchDefault])

  // onSubmit
  const onSubmit = data => {
    console.log('data', data)
    props.setOpen(false)
    if (props.callback) {
      props.callback(props.addNodeRef, props.nodeParent, data)
    }
  }

  // react hook form
  const hookForm = useForm()
  const {
    register,
    unregister,
    errors,
    watch,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setValue,
    getValues,
    trigger,
    control,
    formState,
  } = hookForm

  // console.log(nodeType)
  // console.log(props)

  // watch__customRef
  const watch__customRef = watch('__customRef')
  useEffect(() => {
    if (nodeType === 'react/state') {
      if (!!watch__customRef) {
        if (!getValues(`__ref`)) {
          setValue(`__ref`, `${getValues('name')}`)
        }
      } else if (!watch__customRef) {
        setValue(`__ref`, `...${getValues('name')}`)
      }
    }
  }, [watch__customRef])


  return (
    <Dialog
      className={styles.dialog}
      open={props.open}
      onClose={
        e => {
          props.setOpen(false)
        }
      }
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      >
      <FormProvider {...hookForm}>
        <form onSubmit={() => {return false}}>
          <DialogTitle
            className={styles.dialog}
            disableTypography={true}
            >
            <ListItem style={{padding:0}}>
              <IconButton>
                { lookup_icon_for_type(nodeType) }
              </IconButton>
              <Typography id="alert-dialog-title" variant="h6">
                {!!props.addNodeRef ? '[ ' + props.addNodeRef + ' ] - ' + nodeType : nodeType}
              </Typography>
            </ListItem>
          </DialogTitle>
          <DialogContent
            className={styles.dialogContent}
            >
            {
              (
                nodeType === 'react/state'
              )
              &&
              (
                <Controller
                  control={control}
                  key='__customRef'
                  name='__customRef'
                  type="boolean"
                  defaultValue={false}
                  render={props =>
                    (
                      <FormControl
                        className={styles.formControl}
                        error={!!errors.__customRef}
                        >
                        <FormHelperText>Custom Reference</FormHelperText>
                        <Switch
                          name={props.name}
                          checked={props.value}
                          onChange={e => {
                            props.onChange(e.target.checked)
                            if (e.target.checked) {
                              setValue(`__ref`, `${getValues('name')}`)
                            } else {
                              setValue(`__ref`, `...${getValues('name')}`)
                            }
                          }}
                        />
                        {
                          !!errors.__customRef
                          &&
                          <FormHelperText>{errors.__customRef?.message}</FormHelperText>
                        }
                      </FormControl>
                    )
                  }
                />
              )
            }
            {
              (
                (
                  (nodeType !== 'react/state')
                  && !!props.addNodeRefRequired
                  && !props.addNodeRef
                )
                ||
                (
                  (nodeType === 'react/state')
                  && !!getValues('__customRef')
                )
              )
              &&
              (
                <Controller
                  name="__ref"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "Reference name is required",
                    pattern: {
                      value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                      message: 'Reference name must be a valid variable name',
                    },
                    validate: {
                      checkDuplicate: value =>
                        lookup_child_by_ref(parentNode, value) === null
                        || 'Reference name is duplicate with an existing child',
                      checkSwitchChild: value =>
                        parentNode?.data?.type !== 'js/switch'
                        || value === 'default'
                        || 'Reference name for js/switch must be [default]',
                      checkMapChild: value =>
                        parentNode?.data?.type !== 'js/map'
                        || value === 'data'
                        || value === 'result'
                        || 'Reference name for js/map must be [data] or [result]',
                      checkReduceChild: value =>
                        parentNode?.data?.type !== 'js/reduce'
                        || value === 'data'
                        || 'Reference name for js/reduce must be [data]',
                      checkFilterChild: value =>
                        parentNode?.data?.type !== 'js/filter'
                        || value === 'data'
                        || 'Reference name for js/filter must be [data]',
                      checkReactElementChild: value =>
                        parentNode?.data?.type !== 'react/element'
                        || value === 'props'
                        || 'Reference name for react/element must be [props]',
                      checkReactHtmlChild: value =>
                        parentNode?.data?.type !== 'react/html'
                        || value === 'props'
                        || 'Reference name for react/html must b3 [props]',
                    },
                  }}
                  render={props =>
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Reference"
                        onChange={props.onChange}
                        value={props.value}
                        error={!!errors.__ref}
                        helperText={errors.__ref?.message}
                        />
                    </FormControl>
                  }
                  />
              )
            }
            {
              !!props.nodeParent
              && !!props.nodeParent.data
              && !!props.nodeParent.data.type
              && props.nodeParent.data.type === 'js/switch'
              &&
              (
                <Controller
                  name="default"
                  type="boolean"
                  control={control}
                  defaultValue={isSwitchDefault}
                  rules={{
                    validate: {
                      checkDuplicate: value =>
                        !value
                        || lookup_child_by_ref(props.nodeParent, 'default') === null
                        || 'Default condition already exists'
                    },
                  }}
                  render={props =>
                    (
                      <FormControl
                        className={styles.formControl}
                        error={!!errors.default}
                        >
                        <FormHelperText>Is Default</FormHelperText>
                        <FormControlLabel
                          control={
                            <Switch
                              name={props.name}
                              checked={props.value}
                              onChange={e => {
                                props.onChange(e.target.checked)
                                setSwitchDefault(e.target.checked)
                              }}
                            />
                          }
                          label=""
                          />
                          {
                            !!errors.default
                            &&
                            <FormHelperText>{errors.default?.message}</FormHelperText>
                          }
                      </FormControl>
                    )
                  }
                />
              )
            }
            {
              !!props.nodeParent
              && !!props.nodeParent.data
              && !!props.nodeParent.data.type
              && props.nodeParent.data.type === 'js/switch'
              && !isSwitchDefault
              &&
              (
                <Controller
                  name="condition"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "Condition is required",
                    validate: {
                      conditionSyntax: value => {
                        try {
                          parseExpression(String(value))
                          return true
                        } catch (err) {
                          return String(err)
                        }
                      }
                    },
                  }}
                  render={props =>
                    <FormControl className={styles.formControl}>
                      <TextField
                        label="Condition"
                        onChange={props.onChange}
                        value={props.value}
                        error={!!errors.condition}
                        helperText={errors.condition?.message}
                        />
                    </FormControl>
                  }
                  />
              )
            }
            {
              (
                !!nodeType
                &&
                (
                  nodeType == 'js/string'
                    || nodeType == 'js/number'
                    || nodeType == 'js/boolean'
                    || nodeType == 'js/null'
                    || nodeType == 'js/expression'
                )
              )
              &&
              (
                <Box>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue={nodeType}
                    rules={{
                      required: "Type is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Type"
                            select={true}
                            name={props.name}
                            value={props.value}
                            onChange={
                              e => {
                                setNodeType(e.target.value)
                                props.onChange(e)
                              }
                            }
                            error={!!errors.type}
                            helperText={errors.type?.message}
                            >
                            <MenuItem value="js/string">
                              <ListItemIcon>
                                { lookup_icon_for_type('js/string') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                js/string
                              </Typography>
                            </MenuItem>
                            <MenuItem value="js/number">
                              <ListItemIcon>
                                { lookup_icon_for_type('js/number') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                js/number
                              </Typography>
                            </MenuItem>
                            <MenuItem value="js/boolean">
                              <ListItemIcon>
                                { lookup_icon_for_type('js/boolean') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                js/boolean
                              </Typography>
                            </MenuItem>
                            <MenuItem value="js/null">
                              <ListItemIcon>
                                { lookup_icon_for_type('js/null') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                js/null
                              </Typography>
                            </MenuItem>
                            <MenuItem value="js/expression">
                              <ListItemIcon>
                                { lookup_icon_for_type('js/expression') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                js/expression
                              </Typography>
                            </MenuItem>
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                  {
                    (nodeType === 'js/string')
                    &&
                    (
                      <Controller
                        name="data"
                        control={control}
                        defaultValue=''
                        rules={{
                          required: "String value is required",
                        }}
                        render={props =>
                          (
                            <FormControl className={styles.formControl}>
                              <TextField
                                label="String"
                                multiline={false}
                                name={props.name}
                                value={props.value}
                                onChange={props.onChange}
                                error={!!errors.data}
                                helperText={errors.data?.message}
                                />
                            </FormControl>
                          )
                        }
                      />
                    )
                  }
                  {
                    (nodeType === 'js/number')
                    &&
                    (
                      <Controller
                        name="data"
                        type="number"
                        control={control}
                        defaultValue={0}
                        rules={{
                          required: "Number is required",
                          validate: {
                            checkNumber: value => !isNaN(Number(value)) || "Must be a number",
                          }
                        }}
                        render={props =>
                          (
                            <FormControl className={styles.formControl}>
                              <TextField
                                label="Number"
                                multiline={false}
                                name={props.name}
                                value={props.value}
                                onChange={props.onChange}
                                error={!!errors.data}
                                helperText={errors.data?.message}
                                />
                            </FormControl>
                          )
                        }
                      />
                    )
                  }
                  {
                    (nodeType === 'js/boolean')
                    &&
                    (
                      <Controller
                        name="data"
                        type="boolean"
                        control={control}
                        defaultValue={true}
                        render={props =>
                          (
                            <FormControl className={styles.formControl}>
                              <FormHelperText>Boolean</FormHelperText>
                              <Switch
                                name={props.name}
                                checked={props.value}
                                onChange={e => props.onChange(e.target.checked)}
                              />
                            </FormControl>
                          )
                        }
                      />
                    )
                  }
                  {
                    (nodeType === 'js/expression')
                    &&
                    (
                      <Controller
                        name="data"
                        control={control}
                        defaultValue=''
                        rules={{
                          required: "Expression is required",
                          validate: {
                            expressionSyntax: value => {
                              try {
                                parseExpression(String(value))
                                return true
                              } catch (err) {
                                return String(err)
                              }
                            }
                          }
                        }}
                        render={props =>
                          (
                            <FormControl className={styles.formControl}>
                                <TextField
                                  label="Expression"
                                  multiline={true}
                                  name={props.name}
                                  value={props.value}
                                  onChange={props.onChange}
                                  error={!!errors.data}
                                  helperText={errors.data?.message}
                                  />
                            </FormControl>
                          )
                        }
                      />
                    )
                  }
                </Box>
              )
            }
            {
              (!!nodeType && nodeType == 'js/array')
              &&
              (
                <Box>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue={nodeType}
                    rules={{
                      required: "Type is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Type"
                            select={true}
                            onChange={
                              e => {
                                setNodeType(e.target.value)
                                props.onChange(e)
                              }
                            }
                            value={props.value}
                            error={!!errors.type}
                            helperText={errors.type?.message}
                            >
                            <MenuItem value="js/array">
                              <ListItemIcon>
                                { lookup_icon_for_type('js/array') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                js/array
                              </Typography>
                            </MenuItem>
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
            }
            {
              (!!nodeType && nodeType == 'js/object')
              &&
              (
                <Box>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue={nodeType}
                    rules={{
                      required: "Type is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Type"
                            select={true}
                            onChange={
                              e => {
                                setNodeType(e.target.value)
                                props.onChange(e)
                              }
                            }
                            value={props.value}
                            error={!!errors.type}
                            helperText={errors.type?.message}
                            >
                            <MenuItem value="js/object">
                              <ListItemIcon>
                                { lookup_icon_for_type('js/object') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                js/object
                              </Typography>
                            </MenuItem>
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
            }
            {
              (!!nodeType && nodeType == 'js/import')
              &&
              (
                <Box>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue={nodeType}
                    rules={{
                      required: "Type is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Type"
                            select={true}
                            onChange={
                              e => {
                                setNodeType(e.target.value)
                                props.onChange(e)
                              }
                            }
                            value={props.value}
                            error={!!errors.type}
                            helperText={errors.type?.message}
                            >
                            <MenuItem value="js/import">
                              <ListItemIcon>
                                { lookup_icon_for_type('js/import') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                js/import
                              </Typography>
                            </MenuItem>
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="name"
                    control={control}
                    defaultValue=''
                    rules={{
                      required: "Import name is required",
                    }}
                    render={props =>
                      (
                        <Box className={styles.formControl}>
                          <AutoCompleteImportName
                            name={props.name}
                            value={props.value}
                            onChange={props.onChange}
                            errors={errors}
                            selectedKey={selectedKey}
                            title="Import Name"
                          />
                        </Box>
                      )
                    }
                  />
                </Box>
              )
            }
            {
              (!!nodeType && nodeType == 'js/block')
              &&
              (
                <Box>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue={nodeType}
                    rules={{
                      required: "Type is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Type"
                            select={true}
                            onChange={
                              e => {
                                setNodeType(e.target.value)
                                props.onChange(e)
                              }
                            }
                            value={props.value}
                            error={!!errors.type}
                            helperText={errors.type?.message}
                            >
                            <MenuItem value="js/block">
                              <ListItemIcon>
                                { lookup_icon_for_type('js/block') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                js/block
                              </Typography>
                            </MenuItem>
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="data"
                    control={control}
                    defaultValue=''
                    rules={{
                      required: "Code block is required",
                      validate: {
                        validSyntax: value => {
                          try {
                            parse(value, {
                              allowReturnOutsideFunction: true, // allow return in the block statement
                            })
                            return true
                          } catch (err) {
                            return String(err)
                          }
                        }
                      }
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Code Block"
                            multiline={true}
                            onChange={props.onChange}
                            value={props.value}
                            error={!!errors.data}
                            helperText={errors.data?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
            }
            {
              (!!nodeType && nodeType == 'js/function')
              &&
              (
                <Box>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue={nodeType}
                    rules={{
                      required: "Type is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Type"
                            select={true}
                            onChange={
                              e => {
                                setNodeType(e.target.value)
                                props.onChange(e)
                              }
                            }
                            value={props.value}
                            error={!!errors.type}
                            helperText={errors.type?.message}
                            >
                            <MenuItem value="js/function">
                              <ListItemIcon>
                                { lookup_icon_for_type('js/function') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                js/function
                              </Typography>
                            </MenuItem>
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                  <TextFieldArray
                    key="params"
                    name="params"
                    label="Parameters"
                    type="text"
                    defaultValues={[]}
                    className={styles.formControl}
                    rules={{
                      required: "Parameter is required",
                      pattern: {
                        value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                        message: "Parameter name must be valid variable name",
                      }
                    }}
                    />
                  <Controller
                    key="body"
                    name="body"
                    control={control}
                    defaultValue=''
                    rules={{
                      required: "Function body is required",
                      validate: {
                        validSyntax: value => {
                          try {
                            parse(value, {
                              allowReturnOutsideFunction: true, // allow return in the block statement
                            })
                            return true
                          } catch (err) {
                            return String(err)
                          }
                        }
                      }
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Body"
                            multiline={true}
                            onChange={props.onChange}
                            value={props.value}
                            error={!!errors.body}
                            helperText={errors.body?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
            }
            {
              (!!nodeType && nodeType == 'js/switch')
              &&
              (
                <Box>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue={nodeType}
                    rules={{
                      required: "Type is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Type"
                            select={true}
                            onChange={
                              e => {
                                setNodeType(e.target.value)
                                props.onChange(e)
                              }
                            }
                            value={props.value}
                            error={!!errors.type}
                            helperText={errors.type?.message}
                            >
                            <MenuItem value="js/switch">
                              <ListItemIcon>
                                { lookup_icon_for_type('js/switch') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                js/switch
                              </Typography>
                            </MenuItem>
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
            }
            {
              (!!nodeType && nodeType == 'js/map')
              &&
              (
                <Box>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue={nodeType}
                    rules={{
                      required: "Type is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Type"
                            select={true}
                            onChange={
                              e => {
                                setNodeType(e.target.value)
                                props.onChange(e)
                              }
                            }
                            value={props.value}
                            error={!!errors.type}
                            helperText={errors.type?.message}
                            >
                            <MenuItem value="js/map">
                              <ListItemIcon>
                                { lookup_icon_for_type('js/map') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                js/map
                              </Typography>
                            </MenuItem>
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
            }
            {
              (!!nodeType && nodeType == 'js/reduce')
              &&
              (
                <Box>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue={nodeType}
                    rules={{
                      required: "Type is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Type"
                            select={true}
                            onChange={
                              e => {
                                setNodeType(e.target.value)
                                props.onChange(e)
                              }
                            }
                            value={props.value}
                            error={!!errors.type}
                            helperText={errors.type?.message}
                            >
                            <MenuItem value="js/reduce">
                              <ListItemIcon>
                                { lookup_icon_for_type('js/reduce') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                js/reduce
                              </Typography>
                            </MenuItem>
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="reducer"
                    control={control}
                    defaultValue=''
                    rules={{
                      required: "Reducer is required",
                      validate: {
                        validSyntax: value => {
                          try {
                            parseExpression(String(value))
                            return true
                          } catch (err) {
                            return String(err)
                          }
                        }
                      }
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Reducer"
                            multiline={true}
                            onChange={props.onChange}
                            value={props.value}
                            error={!!errors.reducer}
                            helperText={errors.reducer?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="init"
                    control={control}
                    defaultValue=''
                    rules={{
                      required: 'Initial value required',
                      validate: {
                        validSyntax: value => {
                          if (value) {
                            try {
                              parseExpression(String(value))
                              return true
                            } catch (err) {
                              return String(err)
                            }
                          }
                        }
                      }
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Initial Value"
                            multiline={true}
                            onChange={props.onChange}
                            value={props.value}
                            error={!!errors.init}
                            helperText={errors.init?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
            }
            {
              (!!nodeType && nodeType == 'js/filter')
              &&
              (
                <Box>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue={nodeType}
                    rules={{
                      required: "Type is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Type"
                            select={true}
                            onChange={
                              e => {
                                setNodeType(e.target.value)
                                props.onChange(e)
                              }
                            }
                            value={props.value}
                            error={!!errors.type}
                            helperText={errors.type?.message}
                            >
                            <MenuItem value="js/filter">
                              <ListItemIcon>
                                { lookup_icon_for_type('js/filter') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                js/filter
                              </Typography>
                            </MenuItem>
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="filter"
                    control={control}
                    defaultValue=''
                    rules={{
                      required: "Filter is required",
                      validate: {
                        validSyntax: value => {
                          try {
                            parseExpression(String(value))
                            return true
                          } catch (err) {
                            return String(err)
                          }
                        }
                      }
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Filter"
                            multiline={true}
                            onChange={props.onChange}
                            value={props.value}
                            error={!!errors.filter}
                            helperText={errors.filter?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
            }
            {
              (
                !!nodeType
                &&
                (
                  nodeType == 'react/element'
                  || nodeType == 'react/html'
                )
              )
              &&
              (
                <Box>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue={nodeType}
                    rules={{
                      required: "Type is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Type"
                            select={true}
                            onChange={
                              e => {
                                setNodeType(e.target.value)
                                props.onChange(e)
                              }
                            }
                            value={props.value}
                            error={!!errors.type}
                            helperText={errors.type?.message}
                            >
                            <MenuItem value="react/element">
                              <ListItemIcon>
                                { lookup_icon_for_type('react/element') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                react/element
                              </Typography>
                            </MenuItem>
                            <MenuItem value="react/html">
                              <ListItemIcon>
                                { lookup_icon_for_type('react/html') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                react/html
                              </Typography>
                            </MenuItem>
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                  {
                    nodeType === 'react/element'
                    &&
                    <Controller
                      name="name"
                      control={control}
                      defaultValue=''
                      rules={{
                        required: "Element name is required",
                      }}
                      render={props =>
                      (
                        <Box className={styles.formControl}>
                          <AutoCompleteImportName
                            name={props.name}
                            value={props.value}
                            onChange={props.onChange}
                            errors={errors}
                            selectedKey={selectedKey}
                            title="Element Name"
                          />
                        </Box>
                      )
                    }
                    />
                  }
                  {
                    nodeType === 'react/html'
                    &&
                    <Controller
                      name="name"
                      control={control}
                      defaultValue=''
                      rules={{
                        required: "HTML tag is required",
                      }}
                      render={props =>
                      (
                        <Box className={styles.formControl}>
                          <AutoCompleteHtmlTag
                            name={props.name}
                            value={props.value}
                            onChange={props.onChange}
                            errors={errors}
                            selectedKey={selectedKey}
                            title="HTML Tag"
                          />
                        </Box>
                      )
                    }
                    />
                  }
                </Box>
              )
            }
            {
              (!!nodeType && nodeType == 'react/state')
              &&
              (
                <Box>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue={nodeType}
                    rules={{
                      required: "Type is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Type"
                            select={true}
                            onChange={
                              e => {
                                setNodeType(e.target.value)
                                props.onChange(e)
                              }
                            }
                            value={props.value}
                            error={!!errors.type}
                            helperText={errors.type?.message}
                            >
                            <MenuItem value="react/state">
                              <ListItemIcon>
                                { lookup_icon_for_type('react/state') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                react/state
                              </Typography>
                            </MenuItem>
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="name"
                    control={control}
                    defaultValue=''
                    rules={{
                      required: "Name is required",
                      pattern: {
                        value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                        message: "Name must be valid variable name"
                      }
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Name"
                            onChange={props.onChange}
                            value={props.value}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="setter"
                    control={control}
                    defaultValue=''
                    rules={{
                      required: "Setter is required",
                      pattern: {
                        value: /^[_a-zA-Z][_a-zA-Z0-9]*$/,
                        message: "Setter must be valid variable name"
                      }
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Setter"
                            onChange={props.onChange}
                            value={props.value}
                            error={!!errors.setter}
                            helperText={errors.setter?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="init"
                    control={control}
                    defaultValue=''
                    rules={{
                      validate: {
                        validSyntax: value => {
                          if (value) {
                            try {
                              parseExpression(String(value))
                              return true
                            } catch (err) {
                              return String(err)
                            }
                          }
                        }
                      }
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Initial Value"
                            multiline={true}
                            onChange={props.onChange}
                            value={props.value}
                            error={!!errors.init}
                            helperText={errors.init?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
            }
            {
              (!!nodeType && nodeType == 'react/effect')
              &&
              (
                <Box>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue={nodeType}
                    rules={{
                      required: "Type is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Type"
                            select={true}
                            onChange={
                              e => {
                                setNodeType(e.target.value)
                                props.onChange(e)
                              }
                            }
                            value={props.value}
                            error={!!errors.type}
                            helperText={errors.type?.message}
                            >
                            <MenuItem value="react/effect">
                              <ListItemIcon>
                                { lookup_icon_for_type('react/effect') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                react/effect
                              </Typography>
                            </MenuItem>
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                  <Controller
                    name="data"
                    control={control}
                    defaultValue=''
                    rules={{
                      required: "Effect code is required",
                      validate: {
                        validSyntax: value => {
                          if (value) {
                            try {
                              parse(value, {
                                allowReturnOutsideFunction: true, // allow return in the block statement
                              })
                              return true
                            } catch (err) {
                              return String(err)
                            }
                          }
                        }
                      }
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Code Block"
                            multiline={true}
                            onChange={props.onChange}
                            value={props.value}
                            error={!!errors.data}
                            helperText={errors.data?.message}
                            />
                        </FormControl>
                      )
                    }
                  />
                  <TextFieldArray
                    key="states"
                    name="states"
                    label="States"
                    type="text"
                    defaultValues={[]}
                    className={styles.formControl}
                    rules={{
                      required: "State expression is required",
                      validate: {
                        validSyntax: value => {
                          try {
                            parseExpression(String(value))
                            return true
                          } catch (err) {
                            return String(err)
                          }
                        }
                      }
                    }}
                    />
                </Box>
              )
            }
            {
              (!!nodeType && nodeType == 'mui/style')
              &&
              (
                <Box>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue={nodeType}
                    rules={{
                      required: "Type is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Type"
                            select={true}
                            onChange={
                              e => {
                                setNodeType(e.target.value)
                                props.onChange(e)
                              }
                            }
                            value={props.value}
                            error={!!errors.type}
                            helperText={errors.type?.message}
                            >
                            <MenuItem value="mui/style">
                              <ListItemIcon>
                                { lookup_icon_for_type('mui/style') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                mui/style
                              </Typography>
                            </MenuItem>
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
            }
            {
              (!!nodeType && nodeType == 'appx/route')
              &&
              (
                <Box>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue={nodeType}
                    rules={{
                      required: "Type is required",
                    }}
                    render={props =>
                      (
                        <FormControl className={styles.formControl}>
                          <TextField
                            label="Type"
                            select={true}
                            onChange={
                              e => {
                                setNodeType(e.target.value)
                                props.onChange(e)
                              }
                            }
                            value={props.value}
                            error={!!errors.type}
                            helperText={errors.type?.message}
                            >
                            <MenuItem value="appx/route">
                              <ListItemIcon>
                                { lookup_icon_for_type('appx/route') }
                              </ListItemIcon>
                              <Typography variant="inherit" noWrap={true}>
                                appx/route
                              </Typography>
                            </MenuItem>
                          </TextField>
                        </FormControl>
                      )
                    }
                  />
                </Box>
              )
            }
            {
              (
                !!parentNode?.children
                && parentNode?.children.filter(child => child.data.__ref === null).length > 0
              )
              &&
              (
                <Controller
                  name="__pos"
                  control={control}
                  defaultValue={0}
                  render={props =>
                    (
                      <FormControl className={styles.formControl}>
                        <TextField
                          label="Position"
                          select={true}
                          name={props.name}
                          value={props.value}
                          onChange={props.onChange}
                          error={!!errors.__pos}
                          helperText={errors._pos?.message}
                          >
                          <MenuItem
                            key={0}
                            value={0}
                            >
                            <ListItemIcon>
                              <PlusOutlined />
                            </ListItemIcon>
                            <Typography variant="inherit" noWrap={true}>
                              Add at Beginning
                            </Typography>
                          </MenuItem>
                          {
                            parentNode.children.filter(child => child.data?.__ref === null).map((child, index) => (
                              <MenuItem
                                key={`${index+1}`}
                                value={index+1}
                                >
                                <ListItemIcon>
                                  { lookup_icon_for_type(child.data?.type) }
                                </ListItemIcon>
                                <Typography variant="inherit" noWrap={true}>
                                  Add after [{ lookup_title_for_input(null, child.data) }]
                                </Typography>
                              </MenuItem>
                            ))
                          }
                        </TextField>
                      </FormControl>
                    )
                  }
                />
              )
            }
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={
                e => {
                  props.setOpen(false)
                }
              }
              color="primary"
              >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={
                e => {
                  if (!_.isEmpty(errors)) {
                    console.log('errors', errors)
                  }
                  handleSubmit(onSubmit)()
                }
              }
              color="primary"
              autoFocus
              >
              Add
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  )
}

export default SyntaxAddDialog
